import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UserRole } from "@app/entity";
import { NotificationType } from "@app/entity/notification/notification.enum";
import { BaseNotificationService } from "@app/notification";
import { BaseUserService } from "@app/user";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Resolver } from "@nestjs/graphql";
import { BadRequestGraphQLError, ForbiddenGraphQLError, NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { MatchPostLogStateEnum } from "../../log/match-post-log.enum";
import { MatchPostLogService } from "../../log/match-post-log.service";
import { MatchPostEntity } from "../../post/match-post.entity";
import { MatchPostStateEnum } from "../../post/match-post.enum";
import { MatchPost, MatchPostCreateInput, MatchPostUpdateInput } from "../../post/match-post.model";
import { IMatchBusinessEssentialMutation } from "../../post/match-post.resolve.interface";
import { MatchPostService } from "../../post/match-post.service";


/** 일방적으로 매칭을 할당하는 프로세스 */
@Resolver()
export class OneSidedMatchResolver implements IMatchBusinessEssentialMutation {
    #matchPostService: MatchPostService;
    #baseUserService: BaseUserService;
    #notificationService: BaseNotificationService;
    #matchPostLogService: MatchPostLogService;
    constructor(
        matchPostService: MatchPostService,
        baseUserService: BaseUserService,
        notificationService: BaseNotificationService,
        matchPostLogService: MatchPostLogService
    ) {
        this.#matchPostService = matchPostService;
        this.#baseUserService = baseUserService;
        this.#notificationService = notificationService;
        this.#matchPostLogService = matchPostLogService;
    }

    @Mutation(returns => MatchPost, { description: "매칭 게시물 생성  - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async createMatchPostForAdmin(
        @Args("authorId", { type: () => ID }) authorId: string,
        @Args("data") data: MatchPostCreateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const user = await this.#baseUserService.findOne(authorId);
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
        // await this.#pubSub.publish(MATCH_POST_RECEIVED, updatedPost);
        return updatedPost;
    }
    @Mutation(returns => MatchPost, { description: "매칭 게시물 생성" })
    @UseGuards(JwtGuard)
    async createMatchPost(
        @Args("data") data: MatchPostCreateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const user = await this.#baseUserService.findOne(jwtPayload.id);
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

        // if (
        //     environmentVariablesManager.get("dynamicLinkDomainUrlPrefix") &&
        //     environmentVariablesManager.get<string>("matchPostDeepLinkUrl")
        // ) {
        //     const deepLinkUrl = await this.#dynamicLinkService.createShortLink({
        //         dynamicLinkInfo: {
        //             domainUriPrefix: environmentVariablesManager.get("dynamicLinkDomainUrlPrefix"),
        //             link: environmentVariablesManager.get<string>("matchPostDeepLinkUrl").replace("$match_post_id", newPost.id)
        //         }
        //     });

        //     newPost = await this.#matchPostService.update(newPost.id, { deepLinkUrl: deepLinkUrl });
        // }

        // await this.#pubSub.publish(MATCH_POST_RECEIVED, newPost);

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

        // /**나의 팔로워에게 알림 */
        // const myFollwers = await this.#userFollowService.find({ followingUser: { id: user.id } }, ["follower"]);
        // if (myFollwers && myFollwers.length > 0) {
        //     await this.#notification.sendNotification({
        //         receiver__ids: myFollwers.map(follower => follower.follower.id),
        //         message: `${user.name}${FOLLOWING_POST}`,
        //         url: newPost.deepLinkUrl,
        //         relationId: newPost.id,
        //         type: NotificationTypeEnumType.MATCH_POST,
        //         otherUserId: user.id
        //     });

        //     /** 키워드 알림 */
        //     const extractedkeywords = await this.#notificationKeywordService.searchFromText(
        //         newPost.description + newPost.title
        //     );
        //     if (extractedkeywords && extractedkeywords.length > 0) {
        //         const extractedkeywordUserIds = extractedkeywords.reduce((acc, val) => acc.concat(val.userIds), []);
        //         const receiverIds = [...new Set(extractedkeywordUserIds)];

        //         await this.#notification.sendNotification({
        //             receiver__ids: receiverIds,
        //             message: KEYWORD_NOTI,
        //             url: newPost.deepLinkUrl,
        //             relationId: newPost.id,
        //             type: NotificationTypeEnumType.MATCH_POST,
        //             otherUserId: user.id
        //         });
        //     }
        // }
        return newPost;
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
        // await this.#pubSub.publish(MATCH_POST_RECEIVED, updatedPost);
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
        // await this.#pubSub.publish(MATCH_POST_RECEIVED, deletedPost);
        return deletedPost;
    }

    @Mutation(returns => [MatchPost], { description: "매칭 게시물 복수 삭제 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteMatchPostsForAdmin(@Args("ids", { type: () => [ID] }) ids: string[]): Promise<MatchPostEntity[]> {
        const result = await this.#matchPostService.deleteMany(ids);
        return result;
    }

    @Mutation(returns => MatchPost, { description: "매칭 target 지정하기 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async setMatchTargetForAdmin(
        @Args("matchPostId", { type: () => ID, description: "Match Post Id" }) matchPostId: string,
        @Args("traderId", { type: () => ID, description: "타겟 user Id" }) traderId: string,
    ) {
        const match = await this.#matchPostService.findOne(matchPostId, ["author"]);
        if (match === null) {
            throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.");
        } else if (match.state !== MatchPostStateEnum.IN_PROGRESS) {
            throw new BadRequestGraphQLError("매칭 셋팅을 할 수 없는 상태입니다.")
        } else if (match.traderId !== null) {
            throw new BadRequestGraphQLError("이미 매칭된 매칭 게시물입니다.")
        }
        const user = await this.#baseUserService.findOne(traderId);
        if (user === null) throw new NotFoundGraphQLError("일치하는 유저가 없습니다.");

        if (match.authorId === user.id) throw new BadRequestGraphQLError("게시물 작성자를 매칭 유저로 셋팅 할 수 없습니다.");

        const updatedMatchPost = await this.#matchPostService.useTransaction(async manage => {
            const updatedMatchPost = await this.#matchPostService.updateOne(matchPostId, {
                trader: user,
                state: MatchPostStateEnum.IN_RESERVATION
            }, manage)
            await this.#matchPostLogService.createOne({
                authorId: updatedMatchPost.authorId,
                traderId: updatedMatchPost.traderId,
                matchPostId: updatedMatchPost.id,
            })
            return updatedMatchPost
        })

        await this.#notificationService.send({
            title: "매칭완료",
            message: match.title ? `[${match.title}]요청건에 매칭이 되었습니다.` : "매칭이 성사되었습니다. 확인해주세요.",
            recipients: [{ id: match.author.id }, { id: user.id }],
            relationId: match.id,
            type: NotificationType.MATCH_POST
        })

        // await this.#notificationService.send({
        //     title: "매칭완료",
        //     message: match.title ? `[${match.title}]요청건에 매칭이 되었습니다.` : "매칭이 성사되었습니다. 확인해주세요.",
        //     recipients: [{ id: match.author.id }],
        //     relationId: match.id,
        //     type: NotificationType.MATCH_POST
        // })

        return updatedMatchPost;
    }

    @Mutation(returns => MatchPost, { description: "매칭 target 변경하기 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async changeMatchTargetForAdmin(
        @Args("matchPostId", { type: () => ID, description: "Match Post Id" }) matchPostId: string,
        @Args("traderId", { type: () => ID, description: "변경할 타겟 user Id" }) traderId: string,
    ) {
        const match = await this.#matchPostService.findOne(matchPostId, ["author"]);
        if (match === null) throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.");
        const user = await this.#baseUserService.findOne(traderId);
        if (user === null) throw new NotFoundGraphQLError("일치하는 유저가 없습니다.");

        if (match.authorId === user.id) {
            throw new BadRequestGraphQLError("게시물 작성자를 매칭 유저로 셋팅 할 수 없습니다.");
        } else if (match.state !== MatchPostStateEnum.IN_RESERVATION) {
            throw new BadRequestGraphQLError("매칭 셋팅을 변경 할 수 없는 상태입니다.")
        }

        const nowMatchTraderId = match.traderId;
        const updatedMatchPost = await this.#matchPostService.useTransaction(async manage => {
            const updatedMatchPost = await this.#matchPostService.updateOne(matchPostId, {
                trader: user,
                state: MatchPostStateEnum.IN_RESERVATION
            }, manage)
            await this.#matchPostLogService.updateByMatchIdAndTraderId(match.id, nowMatchTraderId, {
                state: MatchPostLogStateEnum.FAIL
            }, manage)
            await this.#matchPostLogService.createOne({
                authorId: updatedMatchPost.authorId,
                traderId: updatedMatchPost.traderId,
                matchPostId: updatedMatchPost.id,
            }, manage)
            return updatedMatchPost;
        })

        await this.#notificationService.send({
            title: "매칭완료",
            message: match.title ? `[${match.title}]요청건에 매칭이 재매칭 되었습니다.` : "매칭이 재성사되었습니다. 확인해주세요.",
            recipients: [{ id: match.author.id }],
            relationId: match.id,
            type: NotificationType.MATCH_POST
        })
        if (match.traderId) {
            await this.#notificationService.send({
                title: "매칭취소",
                message: match.title ? `[${match.title}]요청건에 매칭이 취소되었습니다.` : "매칭이 취소되었습니다.",
                recipients: [{ id: match.traderId }],
                relationId: match.id,
                type: NotificationType.MATCH_POST
            })
        }

        await this.#notificationService.send({
            title: "매칭완료",
            message: match.title ? `[${match.title}]요청건에 매칭이 되었습니다.` : "매칭이 성사되었습니다. 확인해주세요.",
            recipients: [{ id: user.id }],
            relationId: match.id,
            type: NotificationType.MATCH_POST
        })

        return updatedMatchPost;
    }

    @Mutation(returns => MatchPost, { description: "매칭 종료하기" })
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

    @Mutation(returns => MatchPost, { description: "매칭 종료하기 - 관리자용" })
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
}