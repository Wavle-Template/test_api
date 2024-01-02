import { Field, InputType, Int, PartialType } from "@nestjs/graphql";
import { AdminPostType } from "../admin-post.enum";

@InputType({ description: "관리자 게시물 카테고리 생성 데이터" })
export class AdminPostCategoryCreateInput {
  @Field(type => AdminPostType, { description: "타입" })
  type: string;

  @Field(type => String, { description: "이름" })
  name: string;

  @Field(type => Boolean, { description: "공개 여부" })
  isVisible: boolean;

  @Field(type => Int, { description: "우선 순위", nullable: true })
  priority: number;
}

@InputType({ description: "관리자 게시물 카테고리 수정 데이터" })
export class AdminPostCategoryUpdateInput extends PartialType(AdminPostCategoryCreateInput) {}
