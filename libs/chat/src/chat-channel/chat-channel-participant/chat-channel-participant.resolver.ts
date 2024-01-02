/**
 * @module ChatModule
 */
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { ChatChannelParticipant } from "./chat-channel-participant.model";
import { ChatChannelParticipantLoader } from "./chat-channel-participant.loader";
import { User } from "@app/user/user.model";
import { ChatChannel } from "@app/common-chat-res/channel/chat-channel.model";
import { ChatChannelParticipantEntity } from "@app/common-chat-res";

/**
 * 채팅 참여자 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => ChatChannelParticipant)
export class ChatChannelParticipantResolver {
  /**
   * @param participantLoader 참여자 데이터 로더
   */
  constructor(public participantLoader: ChatChannelParticipantLoader) {}

  @ResolveField(type => ChatChannel, { description: "채팅 채널" })
  async channel(@Parent() participant: ChatChannelParticipantEntity): Promise<ChatChannel> {
    return this.participantLoader.getChannel(participant.id) as Promise<ChatChannel>;
  }

  @ResolveField(type => User, { description: "사용자" })
  async user(@Parent() participant: ChatChannelParticipantEntity): Promise<User> {
    return this.participantLoader.getUser(participant.id);
  }
}
