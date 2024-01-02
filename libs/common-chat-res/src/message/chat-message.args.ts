/**
 * @module ChatModule
 */
import { ChatMessageFilterInput, ChatMessageSortInput, ChatMessageFileFilterInput } from "@app/common-chat-res";
import { ArgsType } from "@nestjs/graphql";
import { EssentialSortInput, MixedPaginationArgs } from "@yumis-coconudge/common-module";

/**
 * 채팅 메시지 목록 페이지네이션 전용 인자
 * @category GraphQL Args Type
 */
@ArgsType()
export class ChatMessageListArgs extends MixedPaginationArgs(ChatMessageFilterInput, ChatMessageSortInput) {}


/**
 * 채팅 메시지 파일 목록 페이지네이션 전용 인자
 * @category GraphQL Args Type
 */
@ArgsType()
export class ChatMessageFileListArgs extends MixedPaginationArgs(ChatMessageFileFilterInput, EssentialSortInput) { }
