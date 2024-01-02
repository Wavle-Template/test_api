import { GraphQLFile } from "@app/file";
import { User } from "@app/user/user.model";
import { Field, GraphQLISODateTime, ID, InputType, Int, ObjectType, OmitType, PartialType } from "@nestjs/graphql";
import {
  BooleanFilterInput,
  DefaultFilterInput,
  DefaultModel,
  DefaultSortInput,
  IDFilterInput,
  Pagination,
  SortInput,
  StringFilterInput
} from "@yumis-coconudge/common-module";
import { CommunityCategory } from "../category/community-category.model";

@ObjectType({ description: "커뮤니티 게시물" })
export class CommunityPost extends DefaultModel {
  @Field({ description: "제목", nullable: true })
  title?: string;

  @Field({ description: "내용" })
  content: string;

  @Field({ description: "주소 명칭", nullable: true })
  addressName?: string;

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

  @Field(type => User, { description: "작성자" })
  author: User;

  @Field(type => CommunityCategory, { description: "연결 커뮤니티 카테고리", nullable: true })
  category?: CommunityCategory;

  @Field(type => Boolean, { description: "보이기 여부" })
  isVisible: boolean;

  @Field(type => [GraphQLFile], { description: "이미지, 영상 목록", nullable: true })
  files?: GraphQLFile[];

  @Field(type => [String], { description: "해시태그", nullable: true })
  hashtags?: string[];

  @Field(type => [User], { description: "사용자 태그", nullable: true })
  usertags?: User[];

  @Field({ nullable: true })
  deepLinkUrl?: string;

  @Field({ nullable: true })
  isPinned: boolean;

  @Field(type => GraphQLISODateTime, { nullable: true })
  pinnedAt?: Date;

  @Field(type => Boolean, { description: "나의 숨기기 여부" })
  isHide: boolean;
}

@ObjectType({ description: "커뮤니티 게시물 목록" })
export class CommunityPostList extends Pagination(CommunityPost) { }

@InputType({ description: "커뮤니티 게시물 생성" })
export class CommunityPostCreateInput {
  @Field({ description: "제목", nullable: true })
  title?: string;

  @Field({ description: "내용" })
  content: string;

  @Field({ description: "주소 명칭", nullable: true })
  addressName?: string;

  @Field({ description: "주소 상세", nullable: true })
  addressDetail?: string;

  @Field(type => ID, { description: "커뮤니티 카테고리 ID", nullable: true })
  category__id?: string;

  @Field(type => [ID], { description: "게시물 파일들", nullable: true })
  file__ids?: string[];

  @Field(type => [String], { description: "해시태그", nullable: true })
  hashtags?: string[];

  @Field(type => [ID], { description: "사용자 ID", nullable: true })
  usertag__ids?: string[];
}

@InputType({ description: "커뮤니티 게시물 수정" })
export class CommunityPostUpdateInput extends PartialType(
  OmitType(CommunityPostCreateInput, ["category__id", "file__ids"])
) {
  @Field(type => Boolean, { description: "보이기 여부", nullable: true })
  isVisible?: boolean;

  @Field(type => [String], { description: "게시물 내 해시태그 키워드 모두", nullable: true })
  hashtag?: string[];

}

@InputType({ description: "커뮤니티 게시물 필터" })
export class CommunityPostFilterInput extends DefaultFilterInput {
  @Field(type => [StringFilterInput], { description: "게시물 제목", nullable: true })
  title?: StringFilterInput[];

  @Field(type => [StringFilterInput], { description: "게시물 내용", nullable: true })
  content?: StringFilterInput[];

  @Field(type => [StringFilterInput], { description: "주소 명칭", nullable: true })
  addressName?: StringFilterInput[];

  @Field(type => [StringFilterInput], { description: "주소 상세", nullable: true })
  addressDetail?: StringFilterInput[];

  @Field(type => [BooleanFilterInput], { description: "숨김여부", nullable: true })
  isVisible?: BooleanFilterInput[];

  @Field(type => [IDFilterInput], { description: "작성자 고유 id", nullable: true })
  author__id?: IDFilterInput[];

  @Field(type => [StringFilterInput], { description: "작성자 이름", nullable: true })
  author__name?: StringFilterInput[];

  @Field(type => [StringFilterInput], { description: "작성자 이메일", nullable: true })
  author__email?: StringFilterInput[];

  @Field(type => [StringFilterInput], { description: "카테고리 고유 id", nullable: true })
  category__id?: StringFilterInput[];

  @Field(type => [StringFilterInput], { description: "카테고리 이름", nullable: true })
  category__name?: StringFilterInput[];

  @Field(type => [StringFilterInput], { description: "해시태그 키워드", nullable: true })
  hashtags__keyword?: StringFilterInput[];

  @Field(type => [StringFilterInput], { description: "태그된 사용자 이름", nullable: true })
  usertags__name?: StringFilterInput[];

  @Field(type => [IDFilterInput], { description: "좋아요 사용자 고유 id", nullable: true })
  likes__id?: IDFilterInput[];

  @Field(type => [BooleanFilterInput], { description: "상단 고정 여부", nullable: true })
  isPinned?: BooleanFilterInput[];
  
  @Field(type => [IDFilterInput], { description: "숨기기한 사용자 고유 id", nullable: true })
  hide__id?: IDFilterInput[];

}

@InputType({ description: "커뮤니티 게시물 정렬" })
export class CommunityPostOrderByInput extends DefaultSortInput {
  @Field(type => SortInput, { description: "조회수 정렬", nullable: true })
  viewCount?: SortInput;

  @Field(type => SortInput, { description: "좋아요수", nullable: true })
  likeCount?: SortInput;

  @Field(type => SortInput, { description: "댓글수", nullable: true })
  replyCount?: SortInput;

  @Field(type => SortInput, { description: "상단 고정된 날짜", nullable: true })
  pinnedAt?: SortInput;
}
