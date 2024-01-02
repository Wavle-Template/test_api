import { ChatChannelCreateInput, ChatChannelFilterInput, ChatChannelOrderByInput } from "@app/common-chat-res";
import { Field, ID, InputType, PartialType } from "@nestjs/graphql";
import { IDFilterInput } from "@yumis-coconudge/common-module";


/**
 * 비즈니스 채팅방 생성 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "비즈니스 채팅방 생성" })
export class BChatChannelCreateInput extends ChatChannelCreateInput {
    @Field(type => ID, { description: "관련 비즈니스 모델의 ID" })
    businessId: string;
}

/**
 * 채팅방 수정 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "비즈니스 채팅방 수정" })
export class BChatChannelUpdateInput extends PartialType(BChatChannelCreateInput) { }

/**
 * 비즈니스 채팅방 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅방 필터" })
export class BChatChannelFilterInput extends ChatChannelFilterInput {
    /** 관련 비즈니스 모델 ID */
    @Field(type => [IDFilterInput], { nullable: true, description: "비즈니스 모델 ID" })
    businessId?: IDFilterInput[];
}

/**
 * 비즈니스 채팅방 정렬 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "채팅방 정렬" })
export class BChatChannelOrderByInput extends ChatChannelOrderByInput { }