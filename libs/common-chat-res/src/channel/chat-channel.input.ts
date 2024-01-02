/**
 * @module ChatModule
 */
import { InputType, Field, ID } from "@nestjs/graphql";
import { PartialType } from "@nestjs/swagger";
import {
  DefaultFilterInput,
  DefaultSortInput,
  EnumFilterInputBase,
  IDFilterInput,
  StringFilterInput,
} from "@yumis-coconudge/common-module";
import { ChatChannelState, ChatChannelType } from "./chat-channel.enum";

/**
 * 채팅방 생성 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅방 생성" })
export class ChatChannelCreateInput {
  /** 공개 여부 */
  @Field(type => Boolean, { description: "공개 여부", defaultValue: true })
  isVisible?: boolean;

  /** 종류 */
  @Field(type => ChatChannelType, { description: "종류" })
  type: ChatChannelType;

  /** 참여자 ID */
  @Field(type => [ID], { description: "참여자 ID" })
  pariticpantUserIds: string[];
}

/**
 * 채팅방 수정 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅방 수정" })
export class ChatChannelUpdateInput extends PartialType(ChatChannelCreateInput) {}

/**
 * 채팅방 상태 필터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅방 상태 필터" })
export class ChatChannelStateEnumFilterInput extends EnumFilterInputBase(ChatChannelState) {}

/**
 * 채팅방 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅방 필터" })
export class ChatChannelFilterInput extends DefaultFilterInput {
  /** 생성자 ID */
  @Field(type => [IDFilterInput], { nullable: true, description: "생성자 ID" })
  creator__id?: IDFilterInput[];

  /** 참여자 ID */
  @Field(type => [IDFilterInput], { nullable: true, description: "참여자 ID" })
  participants__userId?: IDFilterInput[];

  /** 참여자 이름 */
  @Field(type => [StringFilterInput], { nullable: true, description: "참여자 이름" })
  participant_users__name?: StringFilterInput[];

  /** 상태 */
  @Field(type => [ChatChannelStateEnumFilterInput], { nullable: true, description: "상태" })
  state?: ChatChannelStateEnumFilterInput[];
}

/**
 * 채팅방 정렬 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅방 정렬" })
export class ChatChannelOrderByInput extends DefaultSortInput {}
