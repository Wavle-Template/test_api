import { ChatMessage, ChatMessageFileList } from "@app/common-chat-res";
import { ObjectType } from "@nestjs/graphql";
import { Pagination } from "@yumis-coconudge/common-module";

@ObjectType({ description: "비즈니스 채팅 메시지" })
export class BChatMessage extends ChatMessage { }

/**
 * 비즈니스채팅 메시지 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "비즈니스 채팅 메시지 목록" })
export class BChatMessageList extends Pagination(BChatMessage) { }

/**
 * 비즈니스 채팅 메시지 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "비즈니스 채팅 메시지 파일 목록" })
export class BChatMessageFileList extends ChatMessageFileList { }