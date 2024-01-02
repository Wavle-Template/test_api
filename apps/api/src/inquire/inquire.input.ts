import { Field, ID, InputType } from "@nestjs/graphql";
import { DateTimeFilterInput, DefaultFilterInput, DefaultSortInput, EnumFilterInputBase, SortInput, StringFilterInput } from "@yumis-coconudge/common-module";
import { InquireState, InquireType } from "./inquire.enum";

@InputType()
export class InquireTypeFilterInput extends EnumFilterInputBase(
    InquireType
) { }

@InputType()
export class InquireStateFilterInput extends EnumFilterInputBase(
    InquireState
) { }


@InputType({ description: "문의하기 필터링" })
export class InquireFilterInput extends DefaultFilterInput {

    @Field(type => [InquireTypeFilterInput], { description: "문의 종류", nullable: true })
    type?: InquireTypeFilterInput[]

    @Field(type => [StringFilterInput], { description: "제목", nullable: true })
    title?: StringFilterInput[]

    @Field(type => [StringFilterInput], { description: "내용", nullable: true })
    content?: StringFilterInput[]

    @Field(type => [InquireStateFilterInput], { description: "문의 상태", nullable: true })
    state?: InquireStateFilterInput[]

    @Field(type => [StringFilterInput], { description: "답변", nullable: true })
    answerContent?: StringFilterInput[]

    @Field(type => [DateTimeFilterInput], { description: "답변일", nullable: true })
    answereddAt?: DateTimeFilterInput[];

}

@InputType({ description: "문의하기 정렬" })
export class InquireSortInput extends DefaultSortInput {
}

@InputType({ description: "문의하기 생성" })
export class InquireCreateInput {
    @Field(type => InquireType, { description: "문의 종류", nullable: true })
    type?: InquireType

    @Field(type => String, { description: "제목", nullable: true })
    title?: string

    @Field(type => String, { description: "내용" })
    content: string

    @Field(type => [ID], { nullable: "itemsAndList" })
    fileIds?: string[];

}

@InputType({ description: "문의하기 수정" })
export class InquireUpdateInput {
    @Field(type => InquireType, { description: "문의 종류", nullable: true })
    type?: InquireType

    @Field(type => String, { description: "제목", nullable: true })
    title?: string

    @Field(type => String, { description: "내용", nullable: true })
    content?: string

    @Field(type => [ID], { nullable: "itemsAndList" })
    fileIds?: string[];
}

@InputType({ description: "문의하기 수정 - 관리자용" })
export class InquireUpdateInputForAdmin {
    @Field(type => String, { description: "관리자 메모", nullable: true })
    adminMemo?: string;
}