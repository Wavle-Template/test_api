/**
 * @module ChatModule
 */
import { ChatChannelState } from "@app/common-chat-res";
import { Field, ObjectType } from "@nestjs/graphql";
import { DefaultModel, Pagination } from "@yumis-coconudge/common-module";

/**
 * 비즈니스 채팅 채널
 * @category GraphQL Object Type
 */
@ObjectType({ description: "비즈니스 채팅 채널" })
export class BChatChannel extends DefaultModel {
    /** 상태 */
    @Field(type => ChatChannelState, { description: "상태" })
    state: ChatChannelState;

    /** 공개 여부 */
    @Field(type => Boolean, { description: "공개 여부" })
    isVisible: boolean;
}

/**
 * 채팅 채널 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "비즈니스 채팅 채널 목록" })
export class BChatChannelList extends Pagination(BChatChannel) { }
