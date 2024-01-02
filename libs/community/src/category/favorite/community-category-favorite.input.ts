import { Field, ID, InputType } from "@nestjs/graphql";

@InputType({ description: "커뮤니티 카테고리 즐겨찾기 추가" })
export class CommunityCategoryFavoriteCreateInput {
  @Field(type => ID, { description: "사용자 uuid" })
  user__id: string;

  @Field(type => ID, { description: "커뮤니티 카테고리 uuid" })
  communityCategory__id: string;
}
