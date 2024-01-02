import { Field, ObjectType } from "@nestjs/graphql";
import { DefaultModel, Pagination } from "@yumis-coconudge/common-module";
import { ReportCategory, ReportState } from "./report.enum";

@ObjectType({ description: "신고 내역" })
export class Report extends DefaultModel {
  @Field(type => ReportCategory, { description: "신고 대상의 유형" })
  category: ReportCategory;

  @Field({ description: "신고 내용 (500자 이하)" })
  content: string;

  @Field({ description: "비고", nullable: true })
  etc?: string;

  @Field(type => ReportState, { description: "신고 처리 상태" })
  state: ReportState;
}

@ObjectType({ description: "신고 목록" })
export class ReportList extends Pagination(Report) {}
