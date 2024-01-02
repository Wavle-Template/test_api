import { GraphQLFile } from "@app/file";
import { User } from "@app/user/user.model";
import { ArgsType, createUnionType, Field, ID, InputType, ObjectType, OmitType, PartialType } from "@nestjs/graphql";
import { DefaultFilterInput, DefaultModel, DefaultSortInput, EnumFilterInputBase, IDFilterInput, MixedPaginationArgs, Pagination, StringFilterInput } from "@yumis-coconudge/common-module";
import { CommunityPost } from "../post/community-post.model";
import { CommunityPostReply } from "../reply/community-post-reply.model";
import { CommunityReportCategory, CommunityReportState, CommunityReportType } from "./community-report.enum";


@ObjectType({ description: "커뮤니티 신고 모델" })
export class CommunityReport extends DefaultModel {

    // @Field(type => User, { description: "작성자", nullable: true })
    // author: User;

    @Field({ description: "신고 커뮤니티 타겟", nullable: true })
    targetId: string;

    /** 신고내용 */
    @Field({ description: "신고 내용", nullable: true })
    content: string;

    /** 신고 종류 */
    @Field(type => CommunityReportCategory, { description: "신고 카테고리", nullable: true })
    category: string;

    /** 기타 예비용 컬럼 */
    @Field({ description: "기타 예비용 필드", nullable: true })
    etc?: string;

    /** 관리자 메모 */
    // @Field({ description: "신고 내용", nullable: true })
    // adminMemo?: string;

    /** 타입 */
    @Field(type => CommunityReportType, { description: "신고 종류", nullable: true })
    type: string;

    /** 상태 */
    @Field(type => CommunityReportState, { description: "신고 상태", nullable: true })
    state: string;

    /** 참고 이미지 */
    // @Field(type => [GraphQLFile], { description: "이미지, 영상 목록", nullable: true })
    // files?: GraphQLFile[];
}

@ObjectType({ description: "커뮤니티 신고 목록" })
export class CommunityReportList extends Pagination(CommunityReport) { }

@InputType({ description: "커뮤니티 신고 생성" })
export class CommunityReportCreateInput {

    @Field({ description: "신고 커뮤니티 타겟", nullable: true })
    targetId: string;

    /** 신고내용 */
    @Field({ description: "신고 내용", nullable: true })
    content: string;

    /** 신고 종류 */
    @Field(type => CommunityReportCategory, { description: "신고 카테고리", nullable: true })
    category: string;

    @Field({ description: "기타 예비용 필드", nullable: true })
    etc?: string;

    @Field(type => CommunityReportType, { description: "신고 종류", nullable: true })
    type: string;

    @Field(type => [ID], { description: "게시물 파일들", nullable: true })
    file__ids?: string[];
}

@InputType({ description: "커뮤니티 신고 수정" })
export class CommunityReportUpdateInput extends PartialType(
    OmitType(CommunityReportCreateInput, ["file__ids"])
) { }

@InputType()
export class CommunityReportTypeFilterInput extends EnumFilterInputBase(CommunityReportType) { }

@InputType()
export class CommunityReportCategoryFilterInput extends EnumFilterInputBase(CommunityReportCategory) { }

@InputType()
export class CommunityReportStateFilterInput extends EnumFilterInputBase(CommunityReportState) { }

@InputType({ description: "커뮤니티 신고 필터" })
export class CommunityReportFilterInput extends DefaultFilterInput {

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

    @Field(type => [CommunityReportTypeFilterInput], { description: "신고 타입", nullable: true })
    type?: CommunityReportTypeFilterInput[];

    @Field(type => [CommunityReportCategoryFilterInput], { description: "신고 카테고리", nullable: true })
    category?: CommunityReportCategoryFilterInput[];

    @Field(type => [CommunityReportStateFilterInput], { description: "신고 상태", nullable: true })
    state?: CommunityReportStateFilterInput[];
}

@InputType({ description: "커뮤니티 신고 정렬" })
export class CommunityReportOrderByInput extends DefaultSortInput {

}

/**
 * 커뮤니티 신고 타겟 데이터
 * @category GraphQL Union Type
 */
export const CommunityReportTarget = createUnionType({
    name: "CommunityReportTarget",
    types: () => [CommunityPost, CommunityPostReply],
    resolveType: (value: CommunityPost | CommunityPostReply) => {
        if ("replyCount" in value && "isVisible" in value) return CommunityPost;
        // if ("filename" in value && "mimetype" in value) return CommunityPostReply;

        return CommunityPostReply;
    },
});

@ArgsType()
export class CommunityReportListArgs extends MixedPaginationArgs(CommunityReportFilterInput, CommunityReportOrderByInput) { }