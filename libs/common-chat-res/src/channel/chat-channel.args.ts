/**
 * @module ChatModule
 */
import { ChatChannelFilterInput, ChatChannelOrderByInput } from "@app/common-chat-res";
import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs } from "@yumis-coconudge/common-module";

/**
 * 채팅 채널 목록 페이지네이션 전용 인자
 * @category GraphQL Args Type
 */
@ArgsType()
export class ChatChannelListArgs extends MixedPaginationArgs(ChatChannelFilterInput, ChatChannelOrderByInput) {}
