/**
 * @module ChatModule
 */
import { ChatChannel } from "@app/common-chat-res/channel/chat-channel.model";
import { User } from "@app/user/user.model";
import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";

/**
 * 채팅 참여자 GraphQL 데이터
 * @category GraphQL Object Type
 */
@ObjectType({ description: "채팅 참여자" })
export class ChatChannelParticipant {
  /** 참여 날짜/시간  */
  @Field(type => GraphQLISODateTime, { description: "참여 날짜/시간" })
  createdAt: Date;

  /** 참여한 채널 */
  @Field(type => ChatChannel, { description: "채팅 채널" })
  channel: ChatChannel;

  /** 참여한 사용자 */
  @Field(type => User, { description: "사용자" })
  user: User;
}
