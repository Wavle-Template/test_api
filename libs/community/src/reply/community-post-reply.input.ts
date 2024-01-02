/**
 * 커뮤니티 댓글 input
 * @category GraphQL Input Type
 * @module CommunityModule
 */
import { InputType, Field, ID } from "@nestjs/graphql";
import { OmitType } from "@nestjs/swagger";
import { DefaultFilterInput, IDFilterInput, StringFilterInput, DefaultSortInput, SortInput } from "@yumis-coconudge/common-module";

@InputType({ description: "커뮤니티 게시물 댓글 생성" })
export class CommunityPostReplyCreateInput {
    @Field(type => ID, { description: "게시물 uuid (댓글일 경우만)", nullable: true })
    post__id?: string;

    @Field(type => ID, { description: "상위 댓글 uuid (대댓글일 경우만)", nullable: true })
    parent__id?: string;

    @Field({ description: "댓글 내용" })
    content: string;

    @Field(type => [ID], { description: "사용자 ID", nullable: true })
    usertag__ids?: string[];
}

@InputType({ description: "커뮤니티 게시물 댓글 수정" })
export class CommunityPostReplyUpdateInput {
    @Field({ description: "댓글 내용", nullable: true })
    content?: string;

    @Field(type => [ID], { description: "사용자 ID", nullable: true })
    usertag__ids?: string[];
}

@InputType({ description: "커뮤니티 게시물 댓글 필터" })
export class CommunityPostReplyFilterInput extends DefaultFilterInput {
    @Field(type => [IDFilterInput], { description: "관련 게시물 uuid", nullable: true })
    post__id?: IDFilterInput[];

    @Field(type => [IDFilterInput], { description: "대댓글일 경우 상위 댓글 uuid", nullable: true })
    parent__id?: IDFilterInput[];

    @Field(type => [IDFilterInput], { description: "작성자 uuid", nullable: true })
    author__id?: IDFilterInput[];

    @Field(type => [StringFilterInput], { description: "댓글 내용", nullable: true })
    content?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "태그된 사용자 이름", nullable: true })
    usertags__name?: StringFilterInput[];

    @Field(type => [IDFilterInput], { description: "태그된 사용자 uuid", nullable: true })
    usertags__id?: IDFilterInput[];
}

@InputType({ description: "커뮤니티 게시물 댓글 정렬" })
export class CommunityPostReplyOrderByInput extends DefaultSortInput {
    @Field(type => SortInput, { description: "댓글 내용 정렬", nullable: true })
    content?: SortInput;
}