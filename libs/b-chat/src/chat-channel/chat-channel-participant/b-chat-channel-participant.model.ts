/**
 * @module ChatModule
 */
import { User } from "@app/user/user.model";
import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import { BChatChannel } from "../b-chat-channel.model";

/**
 * 비즈니스 채팅 참여자 GraphQL 데이터
 * @category GraphQL Object Type
 */
@ObjectType({ description: "채팅 참여자" })
export class BChatChannelParticipant {
    /** 참여 날짜/시간  */
    @Field(type => GraphQLISODateTime, { description: "참여 날짜/시간" })
    createdAt: Date;

    /** 참여한 채널 */
    @Field(type => BChatChannel, { description: "채팅 채널" })
    channel: BChatChannel;

    /** 참여한 사용자 */
    @Field(type => User, { description: "사용자" })
    user: User;
}
