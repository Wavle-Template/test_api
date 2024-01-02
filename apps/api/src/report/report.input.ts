import { InputType, Field, ID } from "@nestjs/graphql";
import { PartialType, OmitType } from "@nestjs/swagger";
import {
  DefaultFilterInput,
  DefaultSortInput,
  EnumFilterInputBase,
  IDFilterInput,
} from "@yumis-coconudge/common-module";
import { ReportCategory, ReportState } from "./report.enum";

@InputType({ description: "신고 생성" })
export class ReportCreateInput {
  @Field(type => ID, { description: "신고 당하는 사용자 ID" })
  targetUserId: string;

  @Field(type => ReportCategory, { description: "신고 대상의 유형" })
  category: ReportCategory;

  @Field({ description: "신고 내용 (500자 이하)" })
  content: string;

  @Field({ description: "비고", nullable: true })
  etc?: string;

  @Field(type => [ID], { nullable: "itemsAndList" })
  fileIds?: string[];
}

@InputType({ description: "신고 수정" })
export class ReportUpdateInput extends PartialType(OmitType(ReportCreateInput, ["targetUserId", "content"])) {
  @Field(type => ReportState, { description: "신고 처리 상태", nullable: true })
  state?: ReportState;

  @Field({ description: "관리자 메모", nullable: true })
  adminMemo?: string
}

@InputType()
export class CategoryFilterInput extends EnumFilterInputBase(ReportCategory) { }

@InputType({ description: "신고 필터" })
export class ReportFilterInput extends DefaultFilterInput {
  @Field(type => [IDFilterInput], { description: "작성자 uuid", nullable: true })
  author__id?: IDFilterInput[];

  @Field(type => [IDFilterInput], { description: "신고 당한 사용자 uuid", nullable: true })
  reportedUser__id?: IDFilterInput[];

  @Field(type => [CategoryFilterInput], { description: "신고 대상의 유형", nullable: true })
  category?: CategoryFilterInput[];
}

@InputType({ description: "신고 정렬" })
export class ReportSortInput extends DefaultSortInput { }
