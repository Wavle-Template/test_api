import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UserRole } from "@app/entity";
import { Inject, UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Resolver } from "@nestjs/graphql";
import { BChatChannelCreateInput } from "../chat-channel/b-chat-channel.input";
import { BChatChannel } from "../chat-channel/b-chat-channel.model";
import { IBusinessChatChannelEssentialMutation } from "../chat-channel/b-chat-channel.resolver.interface";
import dedent from "dedent";
import { BaseUserService } from "@app/user";
import { BusinessChatChannelService } from "../chat-channel/b-chat-channel.service";
import { BusinessChatChannelLoader } from "../chat-channel/b-chat.channel.loader";
import { IMatchBusinessEssentialMutation } from "@app/match/post/match-post.resolve.interface";
import { MatchPostEntity } from "@app/match/post/match-post.entity";
import { MatchPost, MatchPostCreateInput, MatchPostUpdateInput } from "@app/match/post/match-post.model";
import { BadRequestGraphQLError, ForbiddenGraphQLError, NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { MatchPostService } from "@app/match";
import { NotificationType } from "@app/entity/notification/notification.enum";
import { MatchPostStateEnum } from "@app/match/post/match-post.enum";
import { B_CHAT_MODULE_PUB_SUB } from "../b-chat.const";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { MATCH_POST_RECEIVED } from "@app/match/match.const";
import { BusinessChatMessageService } from "../chat-message/b-chat-message.service";
import { MatchPostLogService } from "@app/match/log/match-post-log.service";
import { MatchPostLogStateEnum } from '@app/match/log/match-post-log.enum'
import { ChatChannelLogic, BusinessChatChannelEntity, ChatChannelState, BusinessChatChannelParticipantEntity, ChatMessageType } from "@app/common-chat-res";
import { BaseNotificationService } from "@app/notification";

@Resolver()
export class BChatChannelWidthMatchResolver implements IBusinessChatChannelEssentialMutation, IMatchBusinessEssentialMutation {
    #chatChannelLogic: ChatChannelLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity>;
    #userService: BaseUserService;
    #matchPostService: MatchPostService;
    #notificationService: BaseNotificationService;
    #pubSub: RedisPubSub;
    #bchatChannelService: BusinessChatChannelService;
    #bchatMessageService: BusinessChatMessageService;
    #matchPostLogService: MatchPostLogService;
    constructor(
        bchatChannelService: BusinessChatChannelService,
        chatChannelLoader: BusinessChatChannelLoader,
        userService: BaseUserService,
        matchPostService: MatchPostService,
        notificationService: BaseNotificationService,
        @Inject(B_CHAT_MODULE_PUB_SUB) public pubSub: RedisPubSub,
        bchatMessageService: BusinessChatMessageService,
        matchPostLogService: MatchPostLogService
    ) {
        this.#chatChannelLogic = new ChatChannelLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity>(bchatChannelService, userService)
        this.#userService = userService;
        this.#matchPostService = matchPostService;
        this.#notificationService = notificationService;
        this.#pubSub = pubSub;
        this.#bchatChannelService = bchatChannelService;
        this.#bchatMessageService = bchatMessageService;
        this.#matchPostLogService = matchPostLogService;
    }

    @Mutation(returns => BChatChannel, {
        description: dedent`
        매칭 게시글에 신청하기

        [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

        **에러 코드**
        - \`FORBIDDEN\`: 권한이 없습니다.
        - \`NOT_FOUND\`: 없습니다.
        - \`BAD_REQUEST\`: 본인 매칭 게시글에는 신청 할 수 없습니다.

        ` })
    @UseGuards(JwtGuard)
    async applyMatchChat(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<BusinessChatChannelEntity> {
        const matchPost = await this.#matchPostService.findOne(id, ["author"]);
        if (matchPost === null) {
            throw new NotFoundGraphQLError();
        } else if (matchPost.authorId === jwtPayload.id) {
            throw new BadRequestGraphQLError("본인 매칭 게시글에는 신청 할 수 없습니다.");
        } else if (matchPost.state !== MatchPostStateEnum.IN_PROGRESS) {
            throw new BadRequestGraphQLError("신청 할 수 없는 상태입니다.");
        }
        const jointList = await this.#bchatChannelService.findJoinTarget(id, jwtPayload.id);
        const activeJoinList = jointList.filter(item => item.state === ChatChannelState.ACTIVE);
        const inActiveJoinList = jointList.filter(item => item.state === ChatChannelState.INACTIVE);
        if (activeJoinList.length > 0) {
            throw new BadRequestGraphQLError("이미 신청한 매칭입니다.");
        }
        let chatChannel: BusinessChatChannelEntity = null
        if (inActiveJoinList.length === 0) {
            chatChannel = await this.#bchatChannelService.useTransaction(async manager => {
                const channel = await this.#chatChannelLogic.createDMChannel(matchPost.authorId, jwtPayload, manager);
                const updatedChannel = await this.#bchatChannelService.updateOne(channel.id, {
                    targetId: matchPost.id
                }, manager)
                await this.#matchPostLogService.createOne({
                    authorId: matchPost.authorId,
                    traderId: jwtPayload.id,
                    matchPostId: matchPost.id,
                    state: MatchPostLogStateEnum.MATCHED
                }, manager)
                return updatedChannel;
            })

        } else {
            const firstChannel = inActiveJoinList[0];
            chatChannel = await this.#bchatChannelService.useTransaction(async manager => {
                const updatedChannel = await this.#bchatChannelService.updateOne(firstChannel.id, {
                    targetId: matchPost.id,
                    state: ChatChannelState.ACTIVE
                }, manager)
                await this.#matchPostLogService.updateByMatchIdAndTraderId(matchPost.id, jwtPayload.id, {
                    state: MatchPostLogStateEnum.MATCHED
                }, manager)
                return updatedChannel;
            })
        }

        await this.#notificationService.send({
            recipients: [{ id: matchPost.authorId }],
            title: "매칭 제안",
            message: `${matchPost.title ? `[${matchPost.title}]에 제안이 들어왔습니다.` : "제안이 들어왔습니다."}확인해주세요.`,
            relationId: matchPost.id,
            type: NotificationType.MATCH_POST,
        })

        return chatChannel;
    }

    @Mutation(returns => BChatChannel, {
        description: dedent`
        매칭 신청중 하나 선택하기

        [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

        **에러 코드**
        - \`FORBIDDEN\`: 권한이 없습니다.
        - \`NOT_FOUND\`: 없습니다.
        - \`NOT_FOUND\`: 없는 채팅입니다.
        - \`BAD_REQUEST\`: 매칭 게시글과 일치하지 않는 채팅방입니다.

        ` })
    @UseGuards(JwtGuard)
    async choiceMatchTrader(
        @Args("matchId", { type: () => ID }) matchId: string,
        @Args("channelId", { type: () => ID }) channelId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const matchPost = await this.#matchPostService.findOne(matchId, ["author"]);
        if (matchPost === null) {
            throw new NotFoundGraphQLError();
        } else if (matchPost.authorId !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        } else if (matchPost.state !== MatchPostStateEnum.IN_PROGRESS) {
            throw new BadRequestGraphQLError("선정 할 수 없는 상태입니다.");
        } else if (matchPost.traderId) {
            throw new BadRequestGraphQLError("선정 할 수 없는 상태입니다.");
        }

        const channel = await this.#bchatChannelService.findOne(channelId, ["participants"]);

        if (channel === null) {
            throw new NotFoundGraphQLError("없는 채팅입니다.");
        } else if (matchPost.id !== channel.targetId) {
            throw new BadRequestGraphQLError("매칭 게시글과 일치하지 않는 채팅방입니다.");
        } else if (channel.participants.length > 2 || channel.participants.length < 2) {
            throw new BadRequestGraphQLError("잘 못된 데이터");
        }

        const others = channel.participants.filter(item => item.userId != jwtPayload.id);
        const traderId = others[0].userId;
        let otherChannels: BusinessChatChannelEntity[] = []

        const updatedPost = await this.#bchatChannelService.useTransaction(async manage => {
            const updatedPost = await this.#matchPostService.updateOne(matchPost.id, {
                traderId: traderId,
                state: MatchPostStateEnum.IN_RESERVATION
            }, manage);

            await this.#matchPostLogService.updateByMatchId(matchPost.id, {
                state: MatchPostLogStateEnum.FAIL
            }, manage);

            await this.#matchPostLogService.updateByMatchIdAndTraderId(matchPost.id, traderId, {
                state: MatchPostLogStateEnum.MATCHED
            }, manage);

            otherChannels = await this.#bchatChannelService.updateInActiveFailChannels(matchPost.id, channel.id)
            otherChannels.forEach(async failChannel => {
                await this.#bchatMessageService.send({
                    message: "매칭에서 탈락됬습니다.",
                    channelId: failChannel.id,
                    type: ChatMessageType.SYSTEM
                }, manage)
            })

            return updatedPost;
        });

        await this.#notificationService.send({
            recipients: [{ id: traderId }],
            type: NotificationType.MATCH_POST,
            title: "매칭 선정",
            message: "매칭에 선정되었습니다. 확인해주세요.",
            relationId: updatedPost.id,
        })

        if (otherChannels.length > 0) {
            let failers: BusinessChatChannelParticipantEntity[] = [];
            otherChannels.forEach(item => {
                failers.concat(item.participants);
            })
            await this.#notificationService.send({
                recipients: failers.map(item => ({ id: item.userId })),
                type: NotificationType.MATCH_POST,
                title: "매칭 탈락",
                message: "매칭에서 탈락되었습니다.",
                relationId: updatedPost.id,
            })

        }

        return updatedPost;
    }

    @Mutation(returns => BChatChannel, {
        description: dedent`
        매칭 종료하기

        [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

        **에러 코드**
        - \`FORBIDDEN\`: 권한이 없습니다.
        - \`NOT_FOUND\`: 없습니다.
        - \`NOT_FOUND\`: 없는 채팅입니다.

        ` })
    @UseGuards(JwtGuard)
    async matchPostEnd(
        @Args("matchId", { type: () => ID }) matchId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const match = await this.#matchPostService.findOne(matchId, ["author"]);
        if (match === null) {
            throw new NotFoundGraphQLError();
        } else if (match.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        }

        const updatedMatchPost = await this.#matchPostService.useTransaction(async manage => {
            const updatedMatchPost = await this.#matchPostService.updateOne(match.id, { state: MatchPostStateEnum.DEAL_DONE }, manage)
            if (match.traderId) {
                await this.#matchPostLogService.matchEnd(match.id, match.traderId, {
                    state: MatchPostLogStateEnum.DONE
                }, manage)
            }
            return updatedMatchPost;
        })

        if (match.traderId) {
            await this.#notificationService.send({
                title: "매칭 종료",
                message: match.title ? `[${match.title}]요청건에 매칭이 종료되었습니다.` : "매칭이 종료되었습니다. 확인해주세요.",
                recipients: [{ id: match.traderId }],
                relationId: match.id,
                type: NotificationType.MATCH_POST
            })
        }

        return updatedMatchPost;
    }

    @Mutation(returns => BChatChannel, {
        description: dedent`
        매칭 종료하기 - 관리자용

        [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

        **에러 코드**
        - \`FORBIDDEN\`: 권한이 없습니다.
        - \`NOT_FOUND\`: 없습니다.
        - \`NOT_FOUND\`: 없는 채팅입니다.

        ` })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async matchPostEndForAdmin(
        @Args("matchId", { type: () => ID }) matchId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const match = await this.#matchPostService.findOne(matchId, ["author"]);
        if (match === null) {
            throw new NotFoundGraphQLError();
        } 

        const updatedMatchPost = await this.#matchPostService.useTransaction(async manage => {
            const updatedMatchPost = await this.#matchPostService.updateOne(match.id, { state: MatchPostStateEnum.DEAL_DONE }, manage)
            if (match.traderId) {
                await this.#matchPostLogService.matchEnd(match.id, match.traderId, {
                    state: MatchPostLogStateEnum.DONE
                }, manage)
            }
            return updatedMatchPost;
        })

        if (match.traderId) {
            await this.#notificationService.send({
                title: "매칭 종료",
                message: match.title ? `[${match.title}]요청건에 매칭이 종료되었습니다.` : "매칭이 종료되었습니다. 확인해주세요.",
                recipients: [{ id: match.traderId }],
                relationId: match.id,
                type: NotificationType.MATCH_POST
            })
        }

        return updatedMatchPost;
    }

    @Mutation(returns => MatchPost, { description: "매칭 재오픈하기" })
    @UseGuards(JwtGuard)
    async reOpenMatchPost(
        @Args("matchId", { type: () => ID }) matchId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const match = await this.#matchPostService.findOne(matchId, ["author"]);
        if (match === null) {
            throw new NotFoundGraphQLError();
        } else if (match.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        } else if (match.state !== MatchPostStateEnum.DEAL_DONE) {
            throw new BadRequestGraphQLError("완료된 매칭만 재오픈 할 수 있습니다.")
        }

        const updatedMatchPost = await this.#matchPostService.useTransaction(async manage => {
            await this.#matchPostLogService.updateByMatchIdAndTraderId(match.id, match.traderId, {
                state: MatchPostLogStateEnum.FAIL
            }, manage)
            const updatedMatchPost = await this.#matchPostService.updateOne(match.id, {
                trader: null,
                traderId: null,
                state: MatchPostStateEnum.IN_PROGRESS
            }, manage);

            return updatedMatchPost;
        })
        return updatedMatchPost;
    }

    @Mutation(returns => MatchPost, { description: "매칭 게시글 끌올" })
    @UseGuards(JwtGuard)
    async bumpMatchPost(
        @Args("matchId", { type: () => ID }) matchId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const match = await this.#matchPostService.findOne(matchId, ["author"]);
        if (match === null) {
            throw new NotFoundGraphQLError();
        } else if (match.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        }

        return await this.#matchPostService.updateOne(match.id, {
            createdAt: new Date()
        })
    }

    @Mutation(returns => MatchPost, { description: "매칭 게시글 끌올 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async bumpMatchPostForAdmin(
        @Args("matchId", { type: () => ID }) matchId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const match = await this.#matchPostService.findOne(matchId, ["author"]);
        if (match === null) {
            throw new NotFoundGraphQLError();
        }

        return await this.#matchPostService.updateOne(match.id, {
            createdAt: new Date()
        })
    }

    @Mutation(returns => MatchPost, { description: "매칭 게시물 생성" })
    @UseGuards(JwtGuard)
    async createMatchPost(
        @Args("data") data: MatchPostCreateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const user = await this.#userService.findOne(jwtPayload.id);
        if (user === null) throw new ForbiddenGraphQLError();
        const { usertag__ids, type__id, ...othersData } = data;

        const newPost = await this.#matchPostService.createOne({
            ...othersData,
            category: { id: data.category__id },
            author: { id: user.id },
            usertags:
                usertag__ids != null
                    ? usertag__ids.map(userId => {
                        return { id: userId };
                    })
                    : undefined,
            files: data.file__ids != null ? data.file__ids.map(fileId => ({ id: fileId })) : undefined,
            type: { id: type__id }
        });

        /**멘션 알림 */
        if (usertag__ids) {
            await this.#notificationService.send({
                recipients: usertag__ids.map(item => ({ id: item })),
                message: `${user.name}를 멘션했습니다.`,
                url: newPost.deepLinkUrl,
                relationId: newPost.id,
                type: NotificationType.MATCH_POST,
            });
        }

        return newPost;
    }

    createMatchPostForAdmin(authorId: string, data: MatchPostCreateInput, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity> {
        throw new Error("Method not implemented.");
    }

    @Mutation(returns => MatchPost, { description: "매칭 게시물 수정" })
    @UseGuards(JwtGuard)
    async updateMatchPost(
        @Args("id", { type: () => ID }) id: string,
        @Args("data") data: MatchPostUpdateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const { trader__id, type__id, usertag__ids, ...othersData } = data;
        let traderData: { trader: { id: string } } = null;
        let typeData: { type: { id: string } } = null;

        const matchPost = await this.#matchPostService.findOne(id, ["author"]);
        if (matchPost === null) {
            throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.")
        } else if (matchPost.authorId !== jwtPayload.id) {
            throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.")
        } else if (
            (matchPost.state === MatchPostStateEnum.DEAL_DONE)
        ) {
            throw new BadRequestGraphQLError("이미 거래가 완료되었습니다.");
        } else if (matchPost.state !== MatchPostStateEnum.IN_PROGRESS) {
            throw new BadRequestGraphQLError("변경가능한 상태가 아닙니다.");
        }

        // if (data.state === MatchPostStateEnum.IN_RESERVATION) {
        //     if (!trader__id) {
        //         throw new InvalidGraphQLRequestError("거래 대상자를 지정해주세요");
        //     }
        //     const chatWithTrader = await this.#chatChannelService.find(
        //         { matchPost: { id: id }, creator: { id: trader__id } },
        //         ["creator", "matchPost"]
        //     );
        //     if (!(chatWithTrader && chatWithTrader.length > 0)) {
        //         throw new NotFoundGraphQLError("해당 사용자와의 대화방이 존재하지 않습니다.");
        //     }
        //     traderData = { trader: { id: trader__id } };
        //     const chatChannels = await this.#chatChannelService.find({ matchPost: { id: id } }, ["matchPost", "creator"]);
        //     const unmatchedChatChannels = chatChannels.filter(chat => chat.creator.id !== trader__id);
        //     if (unmatchedChatChannels.length > 0) {
        //         await this.#chatChannelService.update(
        //             unmatchedChatChannels.map(channel => channel.id),
        //             { state: ChatChannelState.INACTIVE }
        //         );
        //     }
        // }

        const updatedPost = await this.#matchPostService.updateOne(id, {
            ...othersData,
            ...traderData,
            ...typeData,
            usertags:
                usertag__ids != null
                    ? usertag__ids.map(userId => {
                        return { id: userId };
                    })
                    : undefined
        });
        await this.#pubSub.publish(MATCH_POST_RECEIVED, updatedPost);
        return updatedPost;
    }
    @Mutation(returns => MatchPost, { description: "매칭 게시물 수정 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateMatchPostForAdmin(
        @Args("id", { type: () => ID }) id: string,
        @Args("data") data: MatchPostUpdateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const { trader__id, type__id, usertag__ids, ...othersData } = data;
        let traderData: { trader: { id: string } } = null;
        let typeData: { type: { id: string } } = null;

        const matchPost = await this.#matchPostService.findOne(id, ["author"]);
        if (matchPost === null) {
            throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.")
        } else if (
            (matchPost.state === MatchPostStateEnum.DEAL_DONE)
        ) {
            throw new BadRequestGraphQLError("이미 거래가 완료되었습니다.");
        } else if (matchPost.state !== MatchPostStateEnum.IN_PROGRESS) {
            throw new BadRequestGraphQLError("변경가능한 상태가 아닙니다.");
        }

        // if (data.state === MatchPostStateEnum.IN_RESERVATION) {
        //     if (!trader__id) {
        //         throw new InvalidGraphQLRequestError("거래 대상자를 지정해주세요");
        //     }
        //     const chatWithTrader = await this.#chatChannelService.find(
        //         { matchPost: { id: id }, creator: { id: trader__id } },
        //         ["creator", "matchPost"]
        //     );
        //     if (!(chatWithTrader && chatWithTrader.length > 0)) {
        //         throw new NotFoundGraphQLError("해당 사용자와의 대화방이 존재하지 않습니다.");
        //     }
        //     traderData = { trader: { id: trader__id } };
        //     const chatChannels = await this.#chatChannelService.find({ matchPost: { id: id } }, ["matchPost", "creator"]);
        //     const unmatchedChatChannels = chatChannels.filter(chat => chat.creator.id !== trader__id);
        //     if (unmatchedChatChannels.length > 0) {
        //         await this.#chatChannelService.update(
        //             unmatchedChatChannels.map(channel => channel.id),
        //             { state: ChatChannelState.INACTIVE }
        //         );
        //     }
        // }

        const updatedPost = await this.#matchPostService.updateOne(id, {
            ...othersData,
            ...traderData,
            ...typeData,
            usertags:
                usertag__ids != null
                    ? usertag__ids.map(userId => {
                        return { id: userId };
                    })
                    : undefined
        });
        await this.#pubSub.publish(MATCH_POST_RECEIVED, updatedPost);
        return updatedPost;
    }
    @Mutation(returns => MatchPost, { description: "매칭 게시물 단일 삭제" })
    @UseGuards(JwtGuard)
    async deleteMatchPost(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {

        const matchPost = await this.#matchPostService.findOne(id, ["author"]);
        if (matchPost === null) {
            throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.")
        } else if (matchPost.authorId !== jwtPayload.id) {
            throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.")
        } else if (
            (matchPost.state === MatchPostStateEnum.DEAL_DONE)
        ) {
            throw new BadRequestGraphQLError("이미 거래가 완료되었습니다.");
        } else if (matchPost.state !== MatchPostStateEnum.IN_PROGRESS) {
            throw new BadRequestGraphQLError("변경가능한 상태가 아닙니다.");
        }

        const deletedPost = await this.#matchPostService.deleteOne(id);
        // if (user.role !== UserRole.ADMIN) {
        //     await this.#bookmarkService.bookmarkThumbnailCacheClear(deletedPost.id, user.id);
        // }
        await this.#pubSub.publish(MATCH_POST_RECEIVED, deletedPost);
        return deletedPost;
    }
    @Mutation(returns => [MatchPost], { description: "매칭 게시물 복수 삭제 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteMatchPostsForAdmin(@Args("ids", { type: () => [ID] }) ids: string[]): Promise<MatchPostEntity[]> {
        const result = await this.#matchPostService.deleteMany(ids);
        await this.#pubSub.publish(MATCH_POST_RECEIVED, result);
        return result;
    }


    /** 이 모듈 프로세스에서는 사용하지 않음 */
    createChatChannelForAdmin(data: BChatChannelCreateInput, jwtPayload: AuthTokenPayload): Promise<BChatChannel> {
        throw new Error("Method not implemented.");
    }
    createDMChannel(otherUserId: string, jwtPayload: AuthTokenPayload): Promise<BChatChannel> {
        throw new Error("Method not implemented.");
    }
}