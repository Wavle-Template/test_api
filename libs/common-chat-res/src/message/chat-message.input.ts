/**
 * @module ChatModule
 */
import { InputType, Field, ID } from "@nestjs/graphql";
import {
  GraphQLJSON,
  EnumFilterInputBase,
  IDFilterInput,
  StringFilterInput,
  SortInput,
  EssentialFilterInput,
  EssentialSortInput,
} from "@yumis-coconudge/common-module";
import { ChatMessageFileType, ChatMessageType } from "../../../common-chat-res/src/message/chat-message.enum";

/**
 * 채팅 메시지 생성 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅 메시지 생성 데이터" })
export class ChatMessageCreateInput {
  /** 메시지 */
  @Field(type => String, { nullable: true, description: "메시지" })
  message?: string;

  /** 종류 */
  @Field(type => ChatMessageType, { description: "종류" })
  type: ChatMessageType;

  /** 추가 데이터 */
  @Field(type => GraphQLJSON, { nullable: true, description: "추가 데이터" })
  payload?: Record<string, unknown>;

  /** 채팅방 ID */
  @Field(type => ID, { description: "채팅방 ID" })
  channelId: string;
}

/**
 * 채팅 메시지 종류 필터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅 메시지 종류 필터" })
export class ChatMessageTypeFilterInput extends EnumFilterInputBase(ChatMessageType) {}

@InputType({ description: "채팅 메시지 파일 타입 필터" })
export class ChatMessageFileTypeFilterInput extends EnumFilterInputBase(ChatMessageFileType) {}

/**
 * 채팅 메시지 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅 메시지 필터 데이터" })
export class ChatMessageFilterInput extends EssentialFilterInput {
  /** 작성자 ID */
  @Field(type => [IDFilterInput], { nullable: true, description: "작성자 ID" })
  author__id?: IDFilterInput[];

  /** 메시지 */
  @Field(type => [StringFilterInput], { nullable: true, description: "메시지" })
  message?: StringFilterInput[];

  /** 종류 */
  @Field(type => [ChatMessageTypeFilterInput], { nullable: true, description: "종류" })
  type?: ChatMessageTypeFilterInput[];

  /** 채팅방 ID */
  @Field(type => [IDFilterInput], { nullable: true, description: "채팅방 ID" })
  channel__id?: IDFilterInput[];
}

/**
 * 채팅 메시지 정렬 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅 메시지 정렬 데이터" })
export class ChatMessageSortInput extends EssentialSortInput {
  /** 메시지 */
  @Field(type => SortInput, { nullable: true, description: "메시지" })
  message?: SortInput;

  /** 종류 */
  @Field(type => SortInput, { nullable: true, description: "종류" })
  type?: SortInput;
}

/**
 * 채팅 메시지 파일 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅 메시지 파일 필터 데이터" })
export class ChatMessageFileFilterInput extends EssentialFilterInput {
  /** 종류 */
  @Field(type => [ChatMessageFileTypeFilterInput], { nullable: true, description: "종류" })
  type?: ChatMessageFileTypeFilterInput[];
  
}