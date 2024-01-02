import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UserRole } from "@app/entity";
import { BaseUserService } from "@app/user";
import { GraphQLJSON, NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { ForbiddenError, UserInputError } from "apollo-server-fastify";
import { GraphQLResolveInfo } from "graphql";
import { RedisPubSub } from "graphql-redis-subscriptions";
import graphqlFields from "graphql-fields";
import { Edge } from "@yumis-coconudge/typeorm-helper";
import { EntityNotFoundError } from "typeorm";
import { BadRequestException } from "@nestjs/common";
import { ChatMessageEntity } from "../entity/chat-message.entity";
import { ChatMessageListArgs, ChatMessageFileListArgs } from "../message/chat-message.args";
import { ChatMessageCreateInput } from "../message/chat-message.input";
import { ChatMessage, ChatMessageList, ChatMessageFileList } from "../message/chat-message.model";
import { AbsChatMessageService } from "../message/abs-chat-message.service";
import { AbsChatChannelService } from "../channel/abs-chat-channel.service";
import { BusinessChatChannelParticipantEntity } from "../entity/b-chat-channel-participant.entity";
import { BusinessChatChannelEntity } from "../entity/b-chat-channel.entity";
import { ChatChannelParticipantEntity } from "../entity/chat-channel-participant.entity";
import { ChatChannelEntity } from "../entity/chat-channel.entity";
import { BusinessChatMessageEntity } from "../entity/b-chat-message.entity";

export class ChatMessageLogic<
    TEntity extends ChatChannelEntity | BusinessChatChannelEntity,
    PEntity extends ChatChannelParticipantEntity | BusinessChatChannelParticipantEntity,
    BEntity extends ChatMessageEntity | BusinessChatMessageEntity
> {
    constructor(
        public chatMessageService: AbsChatMessageService<BEntity>,
        public userService: BaseUserService,
        public chatChannelService: AbsChatChannelService<TEntity, PEntity>,
        public pubSub: RedisPubSub,
        public RECEIVED_KEY: string,
    ) { }

    async chatMessage(
        id: string,
        jwtPayload: AuthTokenPayload,
    ): Promise<ChatMessage | never> {
        const currentUser = await this.userService.findOne(jwtPayload.id, ["blocks"]);
        const message = await this.chatMessageService.findOne(id, ["channel", "channel.participants"]);
        if (message === null) throw new NotFoundGraphQLError("존재하지 않은 메시지입니다.");
        if (
            currentUser.role !== UserRole.ADMIN &&
            message.authorId !== jwtPayload.id &&
            message.channel.participants.some(participant => participant.userId === jwtPayload.id) === false
        )
            throw new ForbiddenError("권한이 없습니다.");
        if (currentUser.blocks.some(block => block.destinationId === message.authorId))
            throw new UserInputError("차단된 사용자의 메시지입니다.");

        return message as unknown as ChatMessage;
    }

    async chatMessagesForAdmin(
        args: ChatMessageListArgs,
        info: GraphQLResolveInfo,
    ): Promise<ChatMessageList | never> {
        const fields = graphqlFields(info);
        let result: Partial<ChatMessageList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.chatMessageService.countByFilterArgs(args),
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.chatMessageService.getEdges(args);
            result = {
                ...result,
                edges: edges as unknown as Edge<ChatMessage>[],
                pageInfo: await this.chatMessageService.getPageInfo(edges, args),
            };
        }
        return result as ChatMessageList;
    }

    async chatMessages(
        channelId: string,
        args: ChatMessageListArgs,
        info: GraphQLResolveInfo,
        jwtPayload: AuthTokenPayload,
    ): Promise<ChatMessageList> {
        const currentUser = await this.userService.findOne(jwtPayload.id, ["blocks"]);
        const channel = await this.chatChannelService.findOne(channelId, ["participants"]);
        if (channel === null) throw new NotFoundGraphQLError("존재하지 않은 채널입니다.");
        if (
            currentUser.role !== UserRole.ADMIN &&
            channel.participants.some(participant => participant.userId === jwtPayload.id) === false
        )
            throw new ForbiddenError("권한이 없습니다.");

        const fields = graphqlFields(info);
        let result: Partial<ChatMessageList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.chatMessageService.countByChannel(channelId, jwtPayload.id, args),
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.chatMessageService.getEdgesByChannel(channelId, jwtPayload.id, args);
            result = {
                ...result,
                edges: edges as unknown as Edge<ChatMessage>[],
                pageInfo: await this.chatMessageService.getPageInfoByChannel(channelId, jwtPayload.id, edges, args),
            };
        }

        return result as ChatMessageList;
    }

    async sendChatMessage(
        data: ChatMessageCreateInput,
        jwtPayload: AuthTokenPayload,
    ): Promise<ChatMessage> {
        const currentUser = await this.userService.findOne(jwtPayload.id);
        const channel = await this.chatChannelService.findOne(data.channelId, ["participants"]);
        if (
            currentUser.role !== UserRole.ADMIN &&
            channel.participants.some(participant => participant.userId === jwtPayload.id) === false
        )
            throw new ForbiddenError("권한이 없습니다.");

        try {
            //@ts-ignore
            const message = await this.chatMessageService.send({
                ...data,
                channel: { id: data.channelId },
                author: { id: jwtPayload.id },
            });
            return message as unknown as ChatMessage;
        } catch (e) {
            if (e instanceof EntityNotFoundError && e.message.includes("ChatChannelEntity")) {
                throw new NotFoundGraphQLError("존재하지 않은 채널입니다.");
            } else if (e instanceof BadRequestException) {
                throw new UserInputError("종료된 채팅방입니다.");
            } else {
                throw e;
            }
        }
    }

    async deleteChatMessage(
        id: string,
        jwtPayload: AuthTokenPayload,
    ): Promise<ChatMessage> {
        const currentUser = await this.userService.findOne(jwtPayload.id);
        const message = await this.chatMessageService.findOne(id);
        if (message === null) throw new NotFoundGraphQLError("존재하지 않은 메시지입니다.");
        if (currentUser.role !== UserRole.ADMIN && message.authorId !== jwtPayload.id)
            throw new ForbiddenError("권한이 없습니다.");
        try {
            return (await this.chatMessageService.deleteOne(id)) as unknown as ChatMessage;
        } catch (e) {
            if (e instanceof EntityNotFoundError) throw new NotFoundGraphQLError("존재하지 않은 메시지입니다.");
        }
    }


    async deleteChatMessages(
        ids: string[],
        jwtPayload: AuthTokenPayload,
    ): Promise<ChatMessage[]> {
        const currentUser = await this.userService.findOne(jwtPayload.id);
        const messages = await this.chatMessageService.findByIds(ids);
        if (messages.length === 0) throw new NotFoundGraphQLError("존재하지 않은 메시지입니다.");
        if (currentUser.role !== UserRole.ADMIN && messages.some(message => message.authorId !== jwtPayload.id) === true)
            throw new ForbiddenError("권한이 없습니다.");

        try {
            return (await this.chatMessageService.deleteMany(ids)) as unknown as ChatMessage[];
        } catch (e) {
            if (e instanceof EntityNotFoundError) throw new NotFoundGraphQLError("존재하지 않은 메시지입니다.");
        }
    }

    async receiveChatMessage(
        channelId: string,
        jwtPayload: AuthTokenPayload,
    ): Promise<AsyncIterator<ChatMessageEntity>> {
        const currentUser = await this.userService.findOne(jwtPayload.id);
        const channel = await this.chatChannelService.findOne(channelId, ["participants"]);
        if (channel === null) throw new NotFoundGraphQLError("존재하지 않은 채널입니다.");
        if (
            currentUser.role !== UserRole.ADMIN &&
            channel.participants.some(participant => participant.userId === jwtPayload.id) === false
        )
            throw new ForbiddenError("권한이 없습니다.");

        return this.pubSub.asyncIterator<ChatMessageEntity>(this.RECEIVED_KEY);
    }

    async readChatMessages(
        channelId: string,
        jwtPayload: AuthTokenPayload,
    ): Promise<boolean> {
        const channel = await this.chatChannelService.findOne(channelId);
        if (channel === null) throw new NotFoundGraphQLError("존재하지 않은 채널입니다.");

        await this.chatMessageService.readAll(channel.id, jwtPayload.id);
        return true;
    }

    async chatPayLoads(
        channelId: string,
        args: ChatMessageFileListArgs,
        info: GraphQLResolveInfo,
        jwtPayload: AuthTokenPayload,
    ) {
        const currentUser = await this.userService.findOne(jwtPayload.id, ["blocks"]);
        const channel = await this.chatChannelService.findOne(channelId, ["participants"]);
        if (channel === null) throw new NotFoundGraphQLError("존재하지 않은 채널입니다.");
        if (
            currentUser.role !== UserRole.ADMIN &&
            channel.participants.some(participant => participant.userId === jwtPayload.id) === false
        )
            throw new ForbiddenError("권한이 없습니다.");

        const fields = graphqlFields(info);
        let result: Partial<ChatMessageFileList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.chatMessageService.countByChannel(channelId, jwtPayload.id, args),
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.chatMessageService.getEdgesByChannel(channelId, jwtPayload.id, args);
            const rebuildEdges = edges.map(edge => ({ cursor: edge.cursor, node: { ...edge.node.payload, createdAt: edge.node.createdAt } }))
            result = {
                ...result,
                edges: rebuildEdges as unknown as Edge<GraphQLJSON>[],
                pageInfo: await this.chatMessageService.getPageInfoByChannel(channelId, jwtPayload.id, edges, args),
            };
        }

        return result as ChatMessageFileList;
    }
}