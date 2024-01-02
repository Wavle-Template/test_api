import { Field, ObjectType } from "@nestjs/graphql";
import { DefaultModel } from "@yumis-coconudge/common-module";

@ObjectType({ description: "관리자가 올린 게시물의 카테고리" })
export class AdminPostCategory extends DefaultModel {
  @Field(type => String, { description: "카테고리 이름" })
  name: string;
}
