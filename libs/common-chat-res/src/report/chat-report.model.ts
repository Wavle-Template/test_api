import { ArgsType, createUnionType, Field, ID, InputType, ObjectType, OmitType, PartialType } from "@nestjs/graphql";
import { DefaultFilterInput, DefaultModel, DefaultSortInput, EnumFilterInputBase, IDFilterInput, MixedPaginationArgs, Pagination, StringFilterInput } from "@yumis-coconudge/common-module";
import { ChatChannel } from "../channel/chat-channel.model";
import { ChatMessage } from "../message/chat-message.model";
import { ChatReportCategory, ChatReportState, ChatReportType } from "./chat-report.enum";

@ObjectType({ description: "채팅 신고 모델" })
export class ChatReport extends DefaultModel {

    // @Field(type => User, { description: "작성자", nullable: true })
    // author: User;

    @Field({ description: "신고 타겟", nullable: true })
    targetId: string;

    /** 신고내용 */
    @Field({ description: "신고 내용", nullable: true })
    content: string;

    /** 신고 종류 */
    @Field(type => ChatReportCategory, { description: "신고 카테고리", nullable: true })
    category: string;

    /** 기타 예비용 컬럼 */
    @Field({ description: "기타 예비용 필드", nullable: true })
    etc?: string;

    /** 관리자 메모 */
    // @Field({ description: "신고 내용", nullable: true })
    // adminMemo?: string;

    /** 타입 */
    @Field(type => ChatReportType, { description: "신고 종류", nullable: true })
    type: string;

    /** 상태 */
    @Field(type => ChatReportState, { description: "신고 상태", nullable: true })
    state: string;

    /** 참고 이미지 */
    // @Field(type => [GraphQLFile], { description: "이미지, 영상 목록", nullable: true })
    // files?: GraphQLFile[];
}

@ObjectType({ description: "채팅 신고 목록" })
export class ChatReportList extends Pagination(ChatReport) { }

@InputType({ description: "채팅 신고 생성" })
export class ChatReportCreateInput {

    @Field({ description: "신고 채팅 타겟", nullable: true })
    targetId: string;

    /** 신고내용 */
    @Field({ description: "신고 내용", nullable: true })
    content: string;

    /** 신고 종류 */
    @Field(type => ChatReportCategory, { description: "신고 카테고리", nullable: true })
    category: string;

    @Field({ description: "기타 예비용 필드", nullable: true })
    etc?: string;

    @Field(type => ChatReportType, { description: "신고 종류", nullable: true })
    type: string;

    @Field(type => [ID], { description: "게시물 파일들", nullable: true })
    file__ids?: string[];
}

@InputType({ description: "채팅 신고 수정" })
export class ChatReportUpdateInput extends PartialType(
    OmitType(ChatReportCreateInput, ["file__ids"])
) { }

@InputType()
export class ChatReportTypeFilterInput extends EnumFilterInputBase(ChatReportType) { }

@InputType()
export class ChatReportCategoryFilterInput extends EnumFilterInputBase(ChatReportCategory) { }

@InputType()
export class ChatReportStateFilterInput extends EnumFilterInputBase(ChatReportState) { }

@InputType({ description: "채팅 신고 필터" })
export class ChatReportFilterInput extends DefaultFilterInput {

    @Field(type => [StringFilterInput], { description: "신고 내용", nullable: true })
    content?: StringFilterInput[];
    
    @Field(type => [IDFilterInput], { description: "작성자 고유 id", nullable: true })
    author__id?: IDFilterInput[];
    
    @Field(type => [StringFilterInput], { description: "작성자 이름", nullable: true })
    author__name?: StringFilterInput[];
    
    @Field(type => [StringFilterInput], { description: "작성자 이메일", nullable: true })
    author__email?: StringFilterInput[];
    
    @Field(type => [StringFilterInput], { description: "기타", nullable: true })
    etc?: StringFilterInput[];

    @Field(type => [ChatReportTypeFilterInput], { description: "신고 타입", nullable: true })
    type?: ChatReportTypeFilterInput[];

    @Field(type => [ChatReportCategoryFilterInput], { description: "신고 카테고리", nullable: true })
    category?: ChatReportCategoryFilterInput[];

    @Field(type => [ChatReportStateFilterInput], { description: "신고 상태", nullable: true })
    state?: ChatReportStateFilterInput[];
}

@InputType({ description: "채팅 신고 정렬" })
export class ChatReportOrderByInput extends DefaultSortInput {

}

/**
 * 채팅 신고 타겟 데이터
 * @category GraphQL Union Type
 */
export const ChatReportTarget = createUnionType({
    name: "ChatReportTarget",
    types: () => [ChatChannel, ChatMessage],
    resolveType: (value: ChatChannel | ChatMessage) => {
        if ("channelId" in value && "authorId" in value) return ChatMessage;
        if ("isVisible" in value && "creatorId" in value) return ChatChannel;

        return null;
    },
});

@ArgsType()
export class ChatReportListArgs extends MixedPaginationArgs(ChatReportFilterInput, ChatReportOrderByInput) { }