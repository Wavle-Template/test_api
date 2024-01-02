import { User } from "@app/user/user.model";
import { Field, GraphQLISODateTime, ObjectType } from "@nestjs/graphql";
import { DefaultModel, Pagination } from "@yumis-coconudge/common-module";
import { InquireState, InquireType } from "./inquire.enum";

@ObjectType({ description: "문의하기 데이터" })
export class Inquire extends DefaultModel {

    @Field(type => User, { description: "작성자" })
    author: User

    @Field(type => InquireType, { description: "문의 종류" })
    type?: InquireType

    @Field(type => String, { description: "제목", nullable: true })
    title?: string

    @Field(type => String, { description: "내용" })
    content: string


    @Field(type => InquireState, { description: "문의 상태" })
    state?: InquireState

    @Field(type => String, { description: "답변", nullable: true })
    answerContent?: string

    @Field(type => GraphQLISODateTime, { description: "답변일", nullable: true })
    answereddAt?: Date;


}

@ObjectType({ description: "문의하기 목록" })
export class InquireList extends Pagination(Inquire) { }