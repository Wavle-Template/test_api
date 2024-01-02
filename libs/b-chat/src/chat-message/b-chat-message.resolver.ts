import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { BaseUserService } from "@app/user";
import { Inject, UseGuards } from "@nestjs/common";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver, Subscription } from "@nestjs/graphql";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { B_CHAT_MODULE_PUB_SUB, B_MESSAGE_RECEIVED } from "../b-chat.const";
import { BusinessChatChannelService } from "../chat-channel/b-chat-channel.service";
import { BusinessChatMessageLoader } from "./b-chat-message.loader";
import { BChatMessage, BChatMessageFileList, BChatMessageList } from "./b-chat-message.model";
import { BusinessChatMessageService } from "./b-chat-message.service";
import dedent from "dedent";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { UserRole } from "@app/entity";
import { BusinessChatMessageFileListArgs, BusinessChatMessageListArgs } from "./b-chat-message.args";
import { GraphQLResolveInfo } from "graphql";
import { BusinessChatMessageCreateInput } from "./b-chat-message.input";
import { User } from "@app/user/user.model";
import { ChatMessageLogic } from "@app/common-chat-res/logics/chat-message.logic";
import { BusinessChatMessageEntity } from "@app/common-chat-res/entity/b-chat-message.entity";
import { BusinessChatChannelEntity, BusinessChatChannelParticipantEntity } from "@app/common-chat-res";

/**
 * 비즈니스 채팅 메시지 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => BChatMessage)
export class BusinsessChatMessageResolver {
    #chatMessageLogic: ChatMessageLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity>;

    constructor(
        public chatMessageService: BusinessChatMessageService,
        public chatMessageLoader: BusinessChatMessageLoader,
        public userService: BaseUserService,
        public chatChannelService: BusinessChatChannelService,
        @Inject(B_CHAT_MODULE_PUB_SUB) public pubSub: RedisPubSub,
    ) {
        this.#chatMessageLogic = new ChatMessageLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity>(chatMessageService, userService, chatChannelService, pubSub, B_MESSAGE_RECEIVED)
    }

    @Query(returns => BChatMessage, {
        description: dedent`
      특정 비즈니스 채팅 메시지를 조회합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않는 메시지입니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`BAD_USER_INPUT\`: 차단된 사용자의 메시지입니다.
    `,
    })
    @UseGuards(JwtGuard)
    async businessChatMessage(
        @Args("id", { type: () => ID, description: "메시지 ID" }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatMessage | never> {
        return await this.#chatMessageLogic.chatMessage(id, jwtPayload)
    }

    @Query(returns => BChatMessageList, {
        description: dedent`
      비즈니스 채팅 메시지 목록을 모두 조회합니다. 관리자 외에 사용할 수 없습니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async businessChatMessagesForAdmin(
        @Args() args: BusinessChatMessageListArgs,
        @Info() info: GraphQLResolveInfo,
    ): Promise<BChatMessageList | never> {
        return await this.#chatMessageLogic.chatMessagesForAdmin(args, info)
    }

    @Query(returns => BChatMessageList, {
        description: dedent`
      특정 비즈니스 채널의 메시지 목록을 조회합니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않는 채널입니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard)
    async businessChatMessages(
        @Args("channelId", { type: () => ID, description: "특정 채널 ID" }) channelId: string,
        @Args() args: BusinessChatMessageListArgs,
        @Info() info: GraphQLResolveInfo,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatMessageList> {
        return await this.#chatMessageLogic.chatMessages(channelId, args, info, jwtPayload)
    }

    @Query(returns => BChatMessageFileList, {
        name: "businessChatPayLoads",
        description: dedent`
      특정 비즈니스 채널의 Payload 리스트를 조회합니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않는 채널입니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard)
    async chatPayLoads(
        @Args("channelId", { type: () => ID, description: "특정 채널 ID" }) channelId: string,
        @Args() args: BusinessChatMessageFileListArgs,
        @Info() info: GraphQLResolveInfo,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatMessageFileList> {
        return await this.#chatMessageLogic.chatPayLoads(channelId, args, info, jwtPayload)
    }

    @Mutation(returns => BChatMessage, {
        description: dedent`
      비즈니스 채팅 메시지를 생성하여 전송합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`NOT_FOUND\`: 채널을 찾을 수 없습니다.
      - \`BAD_USER_INPUT\`: 종료된 채팅방입니다.
    `,
    })
    @UseGuards(JwtGuard)
    async sendBusinessChatMessage(
        @Args("data", { description: "메시지 생성 데이터" }) data: BusinessChatMessageCreateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatMessage> {
        return await this.#chatMessageLogic.sendChatMessage(data, jwtPayload)
    }

    @Mutation(returns => BChatMessage, {
        description: dedent`
      특정 비즈니스 메시지를 삭제합니다. 내가 생성한 메시지이거나 관리자만 가능합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`NOT_FOUND\`: 존재하지 않은 메시지입니다.
    `,
    })
    @UseGuards(JwtGuard)
    async deleteBusinessChatMessage(
        @Args("id", { type: () => ID, description: "메시지 ID" }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatMessage> {
        return await this.#chatMessageLogic.deleteChatMessage(id, jwtPayload)
    }

    @Mutation(returns => [BChatMessage], {
        description: dedent`
      특정 여러 개의 메시지를 삭제합니다. 내가 생성한 메시지이거나 관리자만 가능합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`NOT_FOUND\`: 존재하지 않은 메시지입니다.
    `,
    })
    @UseGuards(JwtGuard)
    async deleteBusinessChatMessages(
        @Args("ids", { type: () => [ID], description: "메시지 ID 목록" }) ids: string[],
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatMessage[]> {
        return await this.#chatMessageLogic.deleteChatMessages(ids, jwtPayload)
    }

    @Subscription(returns => BChatMessage, {
        description: dedent`
      특정 채널의 채팅 메시지를 실시간으로 수신합니다. 관리자 또는 채널에 참여자만 수신받을 수 있습니다.

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않은 채널입니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
        async filter(
            this: BusinsessChatMessageResolver,
            payload: BusinessChatMessageEntity,
            variables: { channelId: string },
            context: { req: { jwtPayload: AuthTokenPayload } },
        ) {
            const jwtPayload = context.req.jwtPayload;
            if (payload.channelId !== variables.channelId) return false;

            const currentUser = await this.userService.findOne(jwtPayload.id, ["blocks"]);
            return currentUser.blocks.some(block => block.destinationId === payload.authorId) === false;
        },
    })
    @UseGuards(JwtGuard)
    async receiveBusinessChatMessage(
        @Args("channelId", { type: () => ID, description: "채널 ID" }) channelId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<AsyncIterator<BusinessChatMessageEntity>> {
        const message = await this.#chatMessageLogic.receiveChatMessage(channelId, jwtPayload);
        return message as AsyncIterator<BusinessChatMessageEntity>
    }

    @Mutation(returns => Boolean, {
        description: dedent`
      특정 채널의 메시지들을 모두 읽음 처리합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않은 채널입니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard)
    async readBusinessChatMessages(
        @Args("channelId", { type: () => ID }) channelId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<boolean> {
        return await this.#chatMessageLogic.readChatMessages(channelId, jwtPayload)
    }

    @ResolveField(returns => User, { name: "author", nullable: true, description: "작성자" })
    async getAuthor(@Parent() message: BChatMessage): Promise<User> {
        return this.chatMessageLoader.getAuthor(message.id);
    }

    @ResolveField(returns => BChatMessage, { name: "channel", description: "채팅방" })
    async getChannel(@Parent() message: BChatMessage): Promise<BChatMessage> {
        return this.chatMessageLoader.getChannel(message.id) as Promise<BChatMessage>;
    }
}