/**
 * @module ChatModule
 */
import { GraphQLFile } from "@app/file";
import { createUnionType, Field, ID, InterfaceType, ObjectType } from "@nestjs/graphql";
import { EssentialModel, GraphQLJSON, Pagination } from "@yumis-coconudge/common-module";
import { ChatMessageType } from "../../../common-chat-res/src/message/chat-message.enum";

/**
 * 채팅 메시지 카드 액션
 * @category GraphQL Object Type
 */
@ObjectType({ description: "채팅 메시지 카드 액션" })
export class ChatMessageCardAction {
  @Field(type => String, { description: "타입" })
  type: string;

  @Field(type => ID, { description: "타겟 ID" })
  targetId: string;
}

/**
 * 채팅 메시지 파일 타입 데이터
 * @category GraphQL Object Type
 */
@ObjectType({ description: "채팅 메시지 파일 타입 데이터" })
export class ChatMessageFileTypePayload extends GraphQLFile { }

/**
 * 채팅 메시지 카드 타입 데이터
 * @category GraphQL Object Type
 */
@ObjectType({ description: "채팅 메시지 카드 타입 데이터" })
export class ChatMessageCardTypePayload {
  /** 카드 이미지 */
  @Field(type => GraphQLFile, { description: "카드 이미지" })
  image: GraphQLFile;

  /** 카드 액션 */
  @Field(type => [ChatMessageCardAction], { description: "카드 액션" })
  actions: ChatMessageCardAction[];
}

/**
 * 채팅 메시지 링크 타입 데이터
 * @category GraphQL Object Type
 */
@ObjectType({ description: "채팅 메시지 링크 타입 데이터" })
export class ChatMessageLinkTypePayload {

  @Field(type => String, { description: "링크(url)" })
  link: string;
}

/**
 * 채팅 메시지 추가 데이터
 * @category GraphQL Union Type
 */
export const ChatMessagePayload = createUnionType({
  name: "ChatMessagePayload",
  types: () => [ChatMessageFileTypePayload, ChatMessageCardTypePayload, ChatMessageLinkTypePayload],
  resolveType: (value: ChatMessageFileTypePayload | ChatMessageCardTypePayload) => {
    if ("image" in value && "actions" in value) return ChatMessageCardTypePayload;
    if ("filename" in value && "mimetype" in value) return ChatMessageFileTypePayload;
    if ("link" in value) return ChatMessageLinkTypePayload

    return null;
  },
});

/**
 * 채팅 메시지
 * @category GraphQL Object Type
 */
@ObjectType({ description: "채팅 메시지" })
export class ChatMessage extends EssentialModel {
  /** 메시지 */
  @Field(type => String, { nullable: true, description: "메시지" })
  message?: string;

  /** 종류 */
  @Field(type => ChatMessageType, { description: "종류" })
  type: ChatMessageType;

  /** 추가 데이터 */
  @Field(type => ChatMessagePayload, { nullable: true, description: "추가 데이터" })
  payload?: typeof ChatMessagePayload;
}

/**
 * 채팅 메시지 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "채팅 메시지 목록" })
export class ChatMessageList extends Pagination(ChatMessage) { }

/**
 * 채팅 메시지 파일 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "채팅 메시지 파일 목록" })
export class ChatMessageFileList extends Pagination(GraphQLJSON) { }
