import { Field, GraphQLISODateTime, ID, InputType, Int, PartialType } from "@nestjs/graphql";
import {
  DefaultFilterInput,
  DefaultSortInput,
  EnumFilterInputBase,
  IDFilterInput,
  SortInput,
  SortInputBase,
} from "@yumis-coconudge/common-module";
import dedent from "dedent";
import { AdminPostAction, AdminPostState, AdminPostType } from "./admin-post.enum";

@InputType({ description: "관리자 게시글 데이터", isAbstract: true })
export class AdminPostInput {
  @Field(type => ID, { description: "카테고리 ID", nullable: true })
  categoryId?: string;

  @Field(type => AdminPostState, { description: "상태", nullable: true })
  state?: string;
}

@InputType({ description: "공지사항 생성 데이터" })
export class NoticeCreateInput extends AdminPostInput {
  @Field(type => String, { description: "제목" })
  title: string;

  @Field(type => String, { description: "내용" })
  content: string;
}

@InputType({ description: "공지사항 수정 데이터" })
export class NoticeUpdateInput extends PartialType(NoticeCreateInput) { }

@InputType({ description: "자주 묻는 질문 생성 데이터" })
export class FaqCreateInput extends AdminPostInput {
  @Field(type => String, { description: "질문" })
  question: string;

  @Field(type => String, { description: "답변" })
  answer: string;

  @Field(type => Int, { description: "우선순위", nullable: true })
  priority?: number;
}

@InputType({ description: "자주 묻는 질문 수정 데이터" })
export class FaqUpdateInput extends PartialType(FaqCreateInput) { }

@InputType({ description: "배너 생성 데이터" })
export class BannerCreateInput extends NoticeCreateInput {

  @Field(type => AdminPostAction,{ description: "클릭 액션" })
  action: AdminPostAction;

  @Field(type => Int, { description: "우선순위", nullable: true })
  priority?: number;

  @Field(type => String, { description: "커버 이미지" })
  coverUrl: string;

  @Field(type => GraphQLISODateTime, {
    description: dedent`
  게시 시작일
  없을시 1990-01-01 00:00:00.000 +0900 으로 생성
  ` })
  publishingPeriodStartAt?: Date;

  @Field(type => GraphQLISODateTime, {
    description: dedent`
  게시 종료일
  없을시 2999-12-31 23:59:59.000 +0900 으로 생성
  ` })
  publishingPeriodEndAt?: Date;

  @Field({ description: "이동 URL", nullable: true })
  linkUrl?: string;
}

@InputType({ description: "배너 수정 데이터" })
export class BannerUpdateInput extends PartialType(BannerCreateInput) { }

@InputType({ description: "팝업 생성 데이터" })
export class PopupCreateInput extends BannerCreateInput { }

@InputType({ description: "팝업 수정 데이터" })
export class PopupUpdateInput extends PartialType(PopupCreateInput) { }

@InputType({ description: "이벤트 생성 데이터" })
export class EventCreateInput extends BannerCreateInput { }

@InputType({ description: "이벤트 수정 데이터" })
export class EventUpdateInput extends PartialType(PopupCreateInput) { }

@InputType()
export class AdminPostTypeFilterInput extends EnumFilterInputBase(AdminPostType) { }

@InputType()
export class AdminPostStateFilterInput extends EnumFilterInputBase(AdminPostState) { }

@InputType({ description: "관리자가 올린 게시물 필터 데이터" })
export class AdminPostFilterInput extends DefaultFilterInput {
  @Field(type => [AdminPostTypeFilterInput], { description: "타입", nullable: true })
  type?: [AdminPostTypeFilterInput];

  @Field(type => [AdminPostStateFilterInput], { description: "상태", nullable: true })
  state?: [AdminPostStateFilterInput];

  @Field(type => [IDFilterInput], { description: "카테고리 ID", nullable: true })
  category__id?: [IDFilterInput];
}

@InputType()
export class AdminPostTypeSortInput extends SortInputBase(AdminPostType) { }

@InputType({ description: "관리자가 올린 게시물 정렬 데이터" })
export class AdminPostSortInput extends DefaultSortInput {
  @Field(type => AdminPostTypeSortInput, { description: "타입", nullable: true })
  type?: AdminPostTypeSortInput;

  @Field(type => SortInput, { description: "카테고리 ID", nullable: true })
  category__id?: SortInput;

  @Field(type => SortInput, { description: "카테고리 이름", nullable: true })
  category__name?: SortInput;

  @Field(type => SortInput, { description: "우선순위", nullable: true })
  priority?: SortInput

  @Field(type => SortInput, { description: "게시 시작일", nullable: true })
  publishingPeriodStartAt?: SortInput

  @Field(type => SortInput, { description: "게시 종료일", nullable: true })
  publishingPeriodEndAt?: SortInput
}
