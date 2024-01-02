import { Field, GraphQLISODateTime, ID, Int, InterfaceType, ObjectType } from "@nestjs/graphql";
import { DefaultModel, Pagination } from "@yumis-coconudge/common-module";
import dedent from "dedent";
import { AdminPostAction, AdminPostState, AdminPostType } from "./admin-post.enum";

@InterfaceType({ description: "관리자가 올린 게시물" })
export class AdminPost extends DefaultModel {
  @Field(type => AdminPostType, { description: "타입" })
  type: AdminPostType;

  @Field(type => AdminPostState, { description: "상태" })
  state: AdminPostState;
}

@ObjectType({ description: "관리자가 올린 게시물" })
export class AdminPostModel extends AdminPost { }

@ObjectType({ description: "공지사항", implements: [AdminPost] })
export class Notice extends AdminPost {
  @Field(type => String, { description: "제목" })
  title: string;

  @Field(type => String, { description: "내용" })
  content: string;
}

@ObjectType({ description: "자주 묻는 질문", implements: [AdminPost] })
export class Faq extends AdminPost {
  @Field(type => String, { description: "질문" })
  question: string;

  @Field(type => String, { description: "답변" })
  answer: string;

  @Field(type => Int, { description: "우선순위" })
  priority: number;
}

@ObjectType({ description: "배너", implements: [AdminPost] })
export class Banner extends Notice {

  @Field(type => AdminPostAction, { description: "클릭 액션" })
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
  publishingPeriodStartAt: Date;

  @Field(type => GraphQLISODateTime, {
    description: dedent`
  게시 종료일
  없을시 2999-12-31 23:59:59.000 +0900 으로 생성
  ` })
  publishingPeriodEndAt: Date;

  @Field({ description: "링크 URL", nullable: true })
  linkUrl?: string;
}

@ObjectType({ description: "팝업", implements: [AdminPost] })
export class Popup extends Banner { }

@ObjectType({ description: "이벤트", implements: [AdminPost] })
export class Event extends Banner { }

@ObjectType({ description: "관리자가 올린 게시물 목록" })
export class AdminPostList extends Pagination(AdminPostModel) { }
