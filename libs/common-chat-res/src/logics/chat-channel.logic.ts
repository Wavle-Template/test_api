import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UserRole } from "@app/entity";
import { BaseUserService } from "@app/user";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { ForbiddenError, UserInputError } from "apollo-server-fastify";
import { GraphQLResolveInfo } from "graphql";
import graphqlFields from "graphql-fields";
import { Edge } from "@yumis-coconudge/typeorm-helper";
import { EntityManager, EntityNotFoundError } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { ChatChannelListArgs } from "../channel/chat-channel.args";
import { ChatChannelState, ChatChannelType } from "../channel/chat-channel.enum";
import { ChatChannelCreateInput } from "../channel/chat-channel.input";
import { ChatChannel, ChatChannelList } from "../channel/chat-channel.model";
import { AbsChatChannelService } from "../channel/abs-chat-channel.service";
import { BusinessChatChannelParticipantEntity } from "../entity/b-chat-channel-participant.entity";
import { BusinessChatChannelEntity } from "../entity/b-chat-channel.entity";
import { ChatChannelParticipantEntity } from "../entity/chat-channel-participant.entity";
import { ChatChannelEntity } from "../entity/chat-channel.entity";

export class ChatChannelLogic<
    TEntity extends ChatChannelEntity | BusinessChatChannelEntity,
    PEntity extends ChatChannelParticipantEntity | BusinessChatChannelParticipantEntity
> {
    constructor(
        public chatChannelService: AbsChatChannelService<TEntity, PEntity>,
        public userService: BaseUserService,
    ) { }

    
    async chatChannel(
        id: string,
        jwtPayload: AuthTokenPayload,
    ): Promise<ChatChannel> {
        const channel = await this.chatChannelService.findOne(id, ["participants"]);
        if (channel === null) throw new NotFoundGraphQLError("존재하지 않은 채널입니다.");
        const currentUser = await this.userService.findOne(jwtPayload.id, ["blocks"]);
        if (
            currentUser.role !== UserRole.ADMIN &&
            channel.participants.some(participant => participant.userId === jwtPayload.id) === false
        )
            throw new ForbiddenError("권한이 없습니다.");

        return channel as ChatChannel;
    }

    async myChatChannels(
        args: ChatChannelListArgs,
        info: GraphQLResolveInfo,
        jwtPayload: AuthTokenPayload,
    ): Promise<ChatChannelList> {
        const fields = graphqlFields(info);
        let result: Partial<ChatChannelList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.chatChannelService.countByFilterArgsAndUser(jwtPayload.id, args),
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = (await this.chatChannelService.getEdgesByUser(jwtPayload.id, args)) as Edge<ChatChannel>[];
            result = {
                ...result,
                edges: edges,
                pageInfo: await this.chatChannelService.getPageInfoByUser(
                    jwtPayload.id,
                    edges as Edge<any>[],
                    args,
                ),
            };
        }

        return result as ChatChannelList;
    }

    
    async chatChannelsForAdmin(
        args: ChatChannelListArgs,
        info: GraphQLResolveInfo,
    ): Promise<ChatChannelList> {
        const fields = graphqlFields(info);
        let result: Partial<ChatChannelList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.chatChannelService.countByFilterArgs(args),
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = (await this.chatChannelService.getEdges(args)) as Edge<ChatChannel>[];
            result = {
                ...result,
                edges: edges,
                pageInfo: await this.chatChannelService.getPageInfo(edges as Edge<any>[], args),
            };
        }

        return result as ChatChannelList;
    }

    
    async createChatChannelForAdmin(
        data: ChatChannelCreateInput,
        jwtPayload: AuthTokenPayload,
        transactionManager?: EntityManager,
    ): Promise<ChatChannel> {
        return await this.chatChannelService.useTransaction(async manage=>{
            //@ts-ignore
            const channel = await this.chatChannelService.createOne({
                ...data,
                state: ChatChannelState.ACTIVE,
                creator: { id: jwtPayload.id },
                participants: [{ user: { id: jwtPayload.id } }, ...data.pariticpantUserIds.map(id => ({ user: { id: id } }))],
            }, manage);

            return channel as ChatChannel;
        }, transactionManager)
    }

    
    async createDMChannel(
        otherUserId: string,
        jwtPayload: AuthTokenPayload,
        transactionManager?: EntityManager,
    ): Promise<ChatChannel> {
        return await this.chatChannelService.useTransaction(async manage=>{
            const otherUser = await this.userService.findOne(otherUserId);
            if (otherUser == null) throw new NotFoundGraphQLError("존재하지 않은 유저입니다.");
            //@ts-ignore
            const channel = await this.chatChannelService.createOne({
                state: ChatChannelState.ACTIVE,
                isVisible: true,
                type: ChatChannelType.DM,
                creator: { id: jwtPayload.id },
                participants: [{ user: { id: jwtPayload.id } }, { user: { id: otherUserId } }],
            }, manage);

            return channel as ChatChannel;
        }, transactionManager)
    }

    async leaveChatChannel(
        id: string,
        jwtPayload: AuthTokenPayload,
        transactionManager?: EntityManager,
    ): Promise<ChatChannel> {
        return await this.chatChannelService.useTransaction(async manage=>{
            try {
                const channel = await this.chatChannelService.leave(id, jwtPayload.id, manage);
                return channel as ChatChannel;
            } catch (e) {
                if (e instanceof EntityNotFoundError) {
                    throw new NotFoundGraphQLError("존재하지 않은 채널입니다.");
                }
                if (e instanceof BadRequestException) {
                    throw new UserInputError(e.message);
                }
            }
        },transactionManager)
    }

    async leaveChatChannels(
        ids: string[],
        jwtPayload: AuthTokenPayload,
        transactionManager?: EntityManager,
    ): Promise<ChatChannel[]> {
        const channels = await this.chatChannelService.leaveMany(ids, jwtPayload.id, transactionManager);
        return channels as ChatChannel[];
    }

    
    async setStateChatChannel(
        id: string,
        state: ChatChannelState,
        transactionManager?: EntityManager,
    ): Promise<ChatChannel> {
        return await this.chatChannelService.useTransaction(async manager=>{
            try {
                //@ts-ignore
                return await this.chatChannelService.updateOne(id,{ state: state }, manager) as ChatChannel
            } catch (e) {
                if (e instanceof EntityNotFoundError) throw new NotFoundGraphQLError("존재하지 않은 채널입니다.");
                else throw e;
            }
        }, transactionManager)
    }

    
    async setPinChatChannel(
        id: string,
        isPinned: boolean,
        jwtPayload: AuthTokenPayload,
        transactionManager?: EntityManager,
    ): Promise<ChatChannel> {
        try {
            await this.chatChannelService.setPin(id, jwtPayload.id, isPinned, transactionManager);
        } catch (e) {
            if (e instanceof EntityNotFoundError) throw new NotFoundGraphQLError("존재하지 않은 채널입니다.");
            else throw e;
        }
        return (await this.chatChannelService.findOne(id)) as ChatChannel;
    }
}