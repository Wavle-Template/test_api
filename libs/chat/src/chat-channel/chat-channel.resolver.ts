/**
 * @module ChatModule
 */
import { UseGuards } from "@nestjs/common";
import { Args, ID, Info, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { ChatChannelLoader } from "./chat-channel.loader";
import { ChatChannelService } from "./chat-channel.service";
import { GraphQLResolveInfo } from "graphql";
import { ChatChannelParticipant } from "./chat-channel-participant/chat-channel-participant.model";
import { UserRole } from "@app/entity";
import dedent from "dedent";
import { BaseUserService } from "@app/user";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { User } from "@app/user/user.model";
import { GraphQLFile } from "@app/file";
import { ChatChannel, ChatChannelList } from "@app/common-chat-res/channel/chat-channel.model";
import { ChatChannelLogic } from "@app/common-chat-res/logics/chat-channel.logic";
import { ChatChannelCreateInput, ChatChannelEntity, ChatChannelListArgs, ChatChannelParticipantEntity, ChatChannelState, ChatMessage } from "@app/common-chat-res";

/**
 * 채팅 채널 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => ChatChannel)
export class ChatChannelResolver {
  #chatChannelLogic: ChatChannelLogic<ChatChannelEntity,ChatChannelParticipantEntity>;
  constructor(
    public chatChannelService: ChatChannelService,
    public userService: BaseUserService,
  ) {
    this.#chatChannelLogic = new ChatChannelLogic(chatChannelService, userService);
  }

  @Query(returns => ChatChannel, {
    description: dedent`
      채널을 조회합니다. 관리자 외에는 채널의 참여자만 조회할 수 있습니다.

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않는 채널입니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async chatChannel(
    @Args("id", { type: () => ID, description: "채널 ID" }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ChatChannel> {
    return await this.#chatChannelLogic.chatChannel(id, jwtPayload)
  }

  @Query(returns => ChatChannelList, {
    description: dedent`
      내가 참여중인 채널 목록을 조회합니다.

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
  ): Promise<ChatChannelList> {
    return await this.#chatChannelLogic.myChatChannels(args, info, jwtPayload)
  }

  @Query(returns => [ChatChannel], {
    description: dedent`
      내가 참여중인 채널중 상단 고정 채널을 모두 조회합니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async myTopChatChannels(
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ChatChannel[]> {
    return await this.chatChannelService.findPinnedChatByUserId(jwtPayload.id) as ChatChannel[];
  }

  @Query(returns => ChatChannelList, {
    description: dedent`
      전체 채널 목록을 조회합니다. 관리자 외에는 사용할 수 없습니다.

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
  ): Promise<ChatChannelList> {
    return await this.#chatChannelLogic.chatChannelsForAdmin(args, info)
  }

  @Mutation(returns => ChatChannel, {
    description: dedent`
      임의로 채널을 생성합니다. 관리자만 사용할 수 있습니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async createChatChannelForAdmin(
    @Args("data", { description: "채널 생성 데이터" }) data: ChatChannelCreateInput,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ChatChannel> {
    return await this.#chatChannelLogic.createChatChannelForAdmin(data, jwtPayload)
  }

  @Mutation(returns => ChatChannel, {
    description: dedent`
      1:1 채널(DM) 생성합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않은 유저입니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async createDMChannel(
    @Args("otherUserId", { type: () => ID, description: "상대방 사용자 ID" }) otherUserId: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ChatChannel> {
    return await this.#chatChannelLogic.createDMChannel(otherUserId, jwtPayload)
  }

  @Mutation(returns => ChatChannel, {
    description: dedent`
      내가 참여중인 채널 중에 특정 채널을 나갑니다.

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
  ): Promise<ChatChannel> {
    return await this.#chatChannelLogic.leaveChatChannel(id, jwtPayload)
  }

  @Mutation(returns => [ChatChannel], {
    description: dedent`
      내가 참여중인 채널 중에 여러 개의 원하는 채널을 나갑니다. 존재하지 않거나 미참여중인 채널은 무시됩니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async leaveChatChannels(
    @Args("ids", { type: () => [ID], description: "채널 ID 목록" }) ids: string[],
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ChatChannel[]> {
    return await this.#chatChannelLogic.leaveChatChannels(ids, jwtPayload)
  }

  @Mutation(returns => ChatChannel, {
    description: dedent`
      채널의 상태를 변경합니다. 관리자 외에는 사용할 수 없습니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`NOT_FOUND\`: 존재하지 않은 채널입니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async setStateChatChannel(
    @Args("id", { type: () => ID, description: "채널 ID" }) id: string,
    @Args("state", { type: () => ChatChannelState, description: "변경할 상태" }) state: ChatChannelState,
  ): Promise<ChatChannel> {
    return await this.#chatChannelLogic.setStateChatChannel(id, state)
  }

  @Mutation(returns => ChatChannel, {
    description: dedent`
      특정 채널을 내 채널 목록(myChatChannels)에서 최상단 고정시킵니다.
    `,
  })
  @UseGuards(JwtGuard)
  async setPinChatChannel(
    @Args("id", { type: () => ID, description: "채널 ID" }) id: string,
    @Args("isPinned", { description: "최상단 고정 여부" }) isPinned: boolean,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<ChatChannel> {
    return await this.#chatChannelLogic.setPinChatChannel(id, isPinned, jwtPayload)
  }

}

@Resolver(of => ChatChannel)
export class ChatChannelResolveFields {

  constructor(
    public chatChannelLoader: ChatChannelLoader
  ) {

  }

  @ResolveField(returns => User, { nullable: true, description: "생성자" })
  async creator(@Parent() channel: ChatChannel): Promise<User> {
    return await this.chatChannelLoader.getCreator(channel.id);
  }

  @ResolveField(returns => [ChatChannelParticipant], { description: "참여자" })
  async participants(@Parent() channel: ChatChannel): Promise<ChatChannelParticipant[]> {
    return this.chatChannelLoader.getParticipants(channel.id) as Promise<ChatChannelParticipant[]>;
  }

  @ResolveField(returns => [GraphQLFile], { nullable: true, description: "사진" })
  async images(@Parent() channel: ChatChannel): Promise<GraphQLFile[]> {
    return this.chatChannelLoader.getImages(channel.id) as Promise<GraphQLFile[]>;
  }

  @ResolveField(returns => [GraphQLFile], { nullable: true, description: "동영상" })
  async videos(@Parent() channel: ChatChannel): Promise<GraphQLFile[]> {
    return this.chatChannelLoader.getVideos(channel.id) as Promise<GraphQLFile[]>;
  }

  @ResolveField(returns => [GraphQLFile], { nullable: true, description: "파일" })
  async files(@Parent() channel: ChatChannel): Promise<GraphQLFile[]> {
    return this.chatChannelLoader.getFiles(channel.id) as Promise<GraphQLFile[]>;
  }

  @ResolveField(returns => Int, { description: "안읽은 메세지 수" })
  async unreadMessageCount(
    @Parent() channel: ChatChannel,
    @CurrentJwtPayload() currentUser: AuthTokenPayload,
  ): Promise<number> {
    return this.chatChannelLoader.getUnreadMessageCount(channel.id, currentUser.id);
  }

  @ResolveField(returns => ChatMessage, { description: "최근 메시지", nullable: true })
  async lastMessage(@Parent() channel: ChatChannel): Promise<ChatMessage> {
    return this.chatChannelLoader.getLastMessage(channel.id) as unknown as Promise<ChatMessage>;
  }
}