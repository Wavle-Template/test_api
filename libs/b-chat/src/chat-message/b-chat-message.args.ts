/**
 * @module ChatModule
 */
import { ChatMessageFileListArgs } from "@app/common-chat-res";
import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs } from "@yumis-coconudge/common-module";
import { BusinessChatMessageFilterInput, BusinessChatMessageSortInput } from "./b-chat-message.input";

/**
 * 비즈니스 채팅 메시지 목록 페이지네이션 전용 인자
 * @category GraphQL Args Type
 */
@ArgsType()
export class BusinessChatMessageListArgs extends MixedPaginationArgs(BusinessChatMessageFilterInput, BusinessChatMessageSortInput) { }

/**
 * 비즈니스 채팅 메시지 목록 페이지네이션 전용 인자
 * @category GraphQL Args Type
 */
@ArgsType()
export class BusinessChatMessageFileListArgs extends ChatMessageFileListArgs { }
