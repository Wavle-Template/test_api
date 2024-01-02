/**
 * @module ChatModule
 */
import { ChatMessageCreateInput, ChatMessageFileFilterInput, ChatMessageFilterInput, ChatMessageSortInput } from "@app/common-chat-res";
import { InputType } from "@nestjs/graphql";

/**
 * 비즈니스 채팅 메시지 생성 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "비즈니스 채팅 메시지 생성 데이터" })
export class BusinessChatMessageCreateInput extends ChatMessageCreateInput {

}


/**
 * 비즈니스 채팅 메시지 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅 메시지 필터 데이터" })
export class BusinessChatMessageFilterInput extends ChatMessageFilterInput {
}

/**
 * 비즈니스 채팅 메시지 정렬 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅 메시지 정렬 데이터" })
export class BusinessChatMessageSortInput extends ChatMessageSortInput {

}

/**
 * 비즈니스 채팅 메시지 파일 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅 메시지 필터 데이터" })
export class BusinessChatMessageFileFilterInput extends ChatMessageFileFilterInput {
}