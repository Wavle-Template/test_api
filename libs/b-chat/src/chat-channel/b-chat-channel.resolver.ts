import { BaseUserService } from "@app/user";
import { Args, ID, Info, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BChatChannel, BChatChannelList } from "./b-chat-channel.model";
import { BusinessChatChannelService } from "./b-chat-channel.service";
import { BusinessChatChannelLoader } from "./b-chat.channel.loader";
import dedent from "dedent";
import { UseGuards } from "@nestjs/common";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { GraphQLResolveInfo } from "graphql";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { UserRole } from "@app/entity";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { User } from "@app/user/user.model";
import { BChatChannelParticipant } from "./chat-channel-participant/b-chat-channel-participant.model";
import { GraphQLFile } from "@app/file";
import { BChatMessage } from "../chat-message/b-chat-message.model";
import { BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, ChatChannelListArgs, ChatChannelState } from "@app/common-chat-res";
import { ChatChannelLogic } from "@app/common-chat-res/logics/chat-channel.logic";

/**
 * 비즈니스 채팅 채널 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => BChatChannel)
export class BusinessChatChannelResolver {
    #chatChannelLogic: ChatChannelLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity>
    constructor(
        public bchatChannelService: BusinessChatChannelService,
        public chatChannelLoader: BusinessChatChannelLoader,
        public userService: BaseUserService,
    ) {
        this.#chatChannelLogic = new ChatChannelLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity>(bchatChannelService, userService)
    }

    @Query(returns => BChatChannel, {
        name: "businessChatChannel",
        description: dedent`
        비즈니스 채널을 조회합니다. 관리자 외에는 채널의 참여자만 조회할 수 있습니다.

        **에러 코드**
        - \`NOT_FOUND\`: 존재하지 않는 채널입니다.
        - \`FORBIDDEN\`: 권한이 없습니다.
        `,
    })
    @UseGuards(JwtGuard)
    async chatChannel(
        @Args("id", { type: () => ID, description: "채널 ID" }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatChannel> {
        return await this.#chatChannelLogic.chatChannel(id, jwtPayload)
    }

    @Query(returns => BChatChannelList, {
        name: "myBusinessChatChannels",
        description: dedent`
      내가 참여중인 비즈니스 채널 목록을 조회합니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard)
    async myChatChannels(
        @Args() args: ChatChannelListArgs,
        @Info() info: GraphQLResolveInfo,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatChannelList> {
        return await this.#chatChannelLogic.myChatChannels(args, info, jwtPayload)
    }

    @Query(returns => [BChatChannel], {
        name: "myTopBusinessChatChannels",
        description: dedent`
      내가 참여중인 비즈니스 채널중 상단 고정 채널을 모두 조회합니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard)
    async myTopChatChannels(
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatChannel[]> {
        return await this.bchatChannelService.findPinnedChatByUserId(jwtPayload.id) as BChatChannel[];
    }

    @Query(returns => BChatChannelList, {
        name: "businessChatChannelsForAdmin",
        description: dedent`
      전체 비즈니스 채널 목록을 조회합니다. 관리자 외에는 사용할 수 없습니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async chatChannelsForAdmin(
        @Args() args: ChatChannelListArgs,
        @Info() info: GraphQLResolveInfo,
    ): Promise<BChatChannelList> {
        return await this.#chatChannelLogic.chatChannelsForAdmin(args, info)
    }


    @Mutation(returns => BChatChannel, {
        name: "leaveBusinessChatChannel",
        description: dedent`
      내가 참여중인 비즈니스 채널 중에 특정 채널을 나갑니다.

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않은 채널입니다.
      - \`BAD_USER_INPUT\`: 참여하지 않은 채널입니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard)
    async leaveChatChannel(
        @Args("id", { type: () => ID, description: "채널 ID" }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatChannel> {
        return await this.#chatChannelLogic.leaveChatChannel(id, jwtPayload)
    }

    @Mutation(returns => [BChatChannel], {
        description: dedent`
      내가 참여중인 비즈니스 채널 중에 여러 개의 원하는 채널을 나갑니다. 존재하지 않거나 미참여중인 비즈니스 채널은 무시됩니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard)
    async leaveChatChannels(
        @Args("ids", { type: () => [ID], description: "채널 ID 목록" }) ids: string[],
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatChannel[]> {
        return await this.#chatChannelLogic.leaveChatChannels(ids, jwtPayload)
    }

    @Mutation(returns => BChatChannel, {
        description: dedent`
      비즈니스 채널의 상태를 변경합니다. 관리자 외에는 사용할 수 없습니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`NOT_FOUND\`: 존재하지 않은 채널입니다.
    `,
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async setStateBusinessChatChannel(
        @Args("id", { type: () => ID, description: "채널 ID" }) id: string,
        @Args("state", { type: () => ChatChannelState, description: "변경할 상태" }) state: ChatChannelState,
    ): Promise<BChatChannel> {
        return await this.#chatChannelLogic.setStateChatChannel(id, state)
    }

    @Mutation(returns => BChatChannel, {
        description: dedent`
      특정 채널을 내 채널 목록(myBusinessChatChannels)에서 최상단 고정시킵니다.
    `,
    })
    @UseGuards(JwtGuard)
    async setPinBusinessChatChannel(
        @Args("id", { type: () => ID, description: "채널 ID" }) id: string,
        @Args("isPinned", { description: "최상단 고정 여부" }) isPinned: boolean,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatChannel> {
        return await this.#chatChannelLogic.setPinChatChannel(id, isPinned, jwtPayload)
    }


    @ResolveField(returns => User, { nullable: true, description: "생성자" })
    async creator(@Parent() channel: BChatChannel): Promise<User> {
        return await this.chatChannelLoader.getCreator(channel.id);
    }

    @ResolveField(returns => [BChatChannelParticipant], { description: "참여자" })
    async participants(@Parent() channel: BChatChannel): Promise<BChatChannelParticipant[]> {
        return this.chatChannelLoader.getParticipants(channel.id) as Promise<BChatChannelParticipant[]>;
    }

    @ResolveField(returns => [GraphQLFile], { nullable: true, description: "사진" })
    async images(@Parent() channel: BChatChannel): Promise<GraphQLFile[]> {
        return this.chatChannelLoader.getImages(channel.id) as Promise<GraphQLFile[]>;
    }

    @ResolveField(returns => [GraphQLFile], { nullable: true, description: "동영상" })
    async videos(@Parent() channel: BChatChannel): Promise<GraphQLFile[]> {
        return this.chatChannelLoader.getVideos(channel.id) as Promise<GraphQLFile[]>;
    }

    @ResolveField(returns => [GraphQLFile], { nullable: true, description: "파일" })
    async files(@Parent() channel: BChatChannel): Promise<GraphQLFile[]> {
        return this.chatChannelLoader.getFiles(channel.id) as Promise<GraphQLFile[]>;
    }

    @ResolveField(returns => Int, { description: "안읽은 메세지 수" })
    async unreadMessageCount(
        @Parent() channel: BChatChannel,
        @CurrentJwtPayload() currentUser: AuthTokenPayload,
    ): Promise<number> {
        return this.chatChannelLoader.getUnreadMessageCount(channel.id, currentUser.id);
    }

    @ResolveField(returns => BChatMessage, { description: "최근 메시지", nullable: true })
    async lastMessage(@Parent() channel: BChatChannel): Promise<BChatChannel> {
        return this.chatChannelLoader.getLastMessage(channel.id) as unknown as Promise<BChatChannel>;
    }
}