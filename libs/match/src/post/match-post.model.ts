import { GraphQLFile } from "@app/file";
import { User } from "@app/user/user.model";
import { ArgsType, Field, ID, InputType, Int, ObjectType } from "@nestjs/graphql";
import { OmitType, PartialType } from "@nestjs/swagger";
import { BooleanFilterInput, DefaultFilterInput, DefaultModel, DefaultSortInput, EnumFilterInputBase, GraphQLJSON, IDFilterInput, IntFilterInput, MixedPaginationArgs, Pagination, SortInput, StringFilterInput } from "@yumis-coconudge/common-module";
import { MatchPostCategory } from "../catrgory/match-post-category.model";
import { MatchPostType } from "../type/match-post-type.model";
import { MatchPostStateEnum } from "./match-post.enum";

@ObjectType({ description: "매칭 게시물" })
export class MatchPost extends DefaultModel {
    @Field(type => MatchPostCategory, { description: "매칭 카테고리", nullable: true })
    category?: MatchPostCategory;

    @Field({ description: "제목", nullable: true })
    title?: string;

    @Field(type => GraphQLJSON, { description: "상세정보", nullable: true })
    detail?: Record<string, unknown>;

    @Field({ description: "설명", nullable: true })
    description?: string;

    @Field({ description: "주소 명칭", nullable: true })
    addressName?: string;

    @Field({ description: "주소 시,도", nullable: true })
    addressSiDo?: string;

    @Field({ description: "주소 시,군,구", nullable: true })
    addressSiGunGu?: string;

    @Field({ description: "주소 상세", nullable: true })
    addressDetail?: string;

    @Field(type => Int, { description: "조회수" })
    viewCount: number;

    @Field(type => Int, { description: "좋아요 수" })
    likeCount: number;

    @Field(type => Int, { description: "댓글 수" })
    replyCount: number;

    @Field(type => Boolean, { description: "나의 좋아요 여부" })
    isLike: boolean;

    @Field(type => MatchPostStateEnum, { description: "매칭 상태" })
    state: MatchPostStateEnum;

    @Field(type => User, { description: "작성자" })
    author: User;

    @Field(type => User, { description: "거래 대상자", nullable: true })
    trader?: User;

    @Field(type => Boolean, { description: "보이기 여부" })
    isVisible: boolean;

    // @Field(type => [GraphQLFile], { description: "이미지, 영상 목록", nullable: true })
    // files?: GraphQLFile[];

    @Field(type => MatchPostType, { description: "게시물 타입", nullable: true })
    type?: MatchPostType;


    @Field(type => [User], { description: "사용자 태그", nullable: true })
    usertags?: User[];

    @Field({ nullable: true })
    deepLinkUrl?: string;
}

@ObjectType({ description: "매칭 게시물 목록" })
export class MatchPostList extends Pagination(MatchPost) { }

@InputType({ description: "매칭 게시물 생성" })
export class MatchPostCreateInput {
    @Field({ description: "제목", nullable: true })
    title?: string;

    @Field(type => GraphQLJSON, { description: "상세정보", nullable: true })
    detail?: Record<string, unknown>;

    @Field({ description: "설명", nullable: true })
    description?: string;

    @Field({ description: "주소 명칭", nullable: true })
    addressName?: string;

    @Field({ description: "주소 시,도", nullable: true })
    addressSiDo?: string;

    @Field({ description: "주소 시,군,구", nullable: true })
    addressSiGunGu?: string;

    @Field({ description: "주소 상세", nullable: true })
    addressDetail?: string;

    @Field(type => ID, { description: "카테고리 고유 id", nullable: true })
    category__id?: string;

    @Field(type => [ID], { description: "게시물 파일들", nullable: true })
    file__ids?: string[];

    @Field(type => [ID], { description: "사용자 멘션 ID", nullable: true })
    usertag__ids?: string[];

    @Field(type => ID, { description: "타입 고유 id", nullable: true })
    type__id?: string;
}

@InputType({ description: "매칭 게시물 수정" })
export class MatchPostUpdateInput extends PartialType(OmitType(MatchPostCreateInput, ["category__id", "file__ids"])) {
    @Field(type => Boolean, { description: "보이기 여부", nullable: true })
    isVisible?: boolean;

    // @Field(type => MatchPostStateEnum, { description: "매칭 상태", nullable: true })
    // state?: MatchPostStateEnum;

    @Field(type => ID, { description: "거래 대상자 고유 id", nullable: true })
    trader__id?: string;

    // @Field(type => [ID], { description: "게시물 내 태그된 사용자 ID 모두", nullable: true })
    // usertag__ids?: string[];
}

@InputType({ description: "매칭 상태 필터" })
export class MatchPostStateEnumFilterInput extends EnumFilterInputBase(MatchPostStateEnum) { }

@InputType({ description: "매칭 게시물 필터" })
export class MatchPostFilterInput extends DefaultFilterInput {
    @Field(type => [StringFilterInput], { description: "제목", nullable: true })
    title?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "설명", nullable: true })
    description?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "주소 명칭", nullable: true })
    addressName?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "주소 시,도", nullable: true })
    addressSiDo?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "주소 시,군,구", nullable: true })
    addressSiGunGu?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "주소 상세", nullable: true })
    addressDetail?: StringFilterInput[];

    @Field(type => [BooleanFilterInput], { description: "숨김여부", nullable: true })
    isVisible?: BooleanFilterInput[];

    @Field(type => [MatchPostStateEnumFilterInput], { description: "매칭 상태", nullable: true })
    state?: MatchPostStateEnumFilterInput[];

    @Field(type => [IntFilterInput], { description: "조회수", nullable: true })
    viewCount?: IntFilterInput[];

    @Field(type => [IntFilterInput], { description: "좋아요수", nullable: true })
    likeCount?: IntFilterInput[];

    @Field(type => [IntFilterInput], { description: "댓글수", nullable: true })
    replyCount?: IntFilterInput[];

    @Field(type => [IDFilterInput], { description: "좋아요 사용자 고유 id", nullable: true })
    likes__id?: IDFilterInput[];

    @Field(type => [IDFilterInput], { description: "작성자 고유 id", nullable: true })
    author__id?: IDFilterInput[];

    @Field(type => [StringFilterInput], { description: "작성자 이름", nullable: true })
    author__name?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "작성자 이메일", nullable: true })
    author__email?: StringFilterInput[];

    @Field(type => [IDFilterInput], { description: "거래 대상자 고유 id", nullable: true })
    trader__id?: IDFilterInput[];

    @Field(type => [StringFilterInput], { description: "거래 대상자 이름", nullable: true })
    trader__name?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "거래 대상자 이메일", nullable: true })
    trader__email?: StringFilterInput[];

    @Field(type => [IDFilterInput], { description: "게시물 타입 고유 id", nullable: true })
    type__id?: IDFilterInput[];

    @Field(type => [StringFilterInput], { description: "게시물 타입 이름", nullable: true })
    type__name?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "카테고리 고유 id", nullable: true })
    category__id?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "카테고리 이름", nullable: true })
    category__name?: StringFilterInput[];

    @Field(type => [StringFilterInput], { description: "태그된 사용자 이름", nullable: true })
    usertags__name?: StringFilterInput[];
}

@InputType({ description: "매칭 게시물 정렬" })
export class MatchPostOrderByInput extends DefaultSortInput {
    @Field(type => SortInput, { description: "조회수", nullable: true })
    viewCount?: SortInput;

    @Field(type => SortInput, { description: "좋아요수", nullable: true })
    likeCount?: SortInput;

    @Field(type => SortInput, { description: "댓글수", nullable: true })
    replyCount?: SortInput;
}

@ArgsType()
export class MatchPostListArgs extends MixedPaginationArgs(MatchPostFilterInput, MatchPostOrderByInput) { }
