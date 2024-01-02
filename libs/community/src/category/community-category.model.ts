import { Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { DefaultFilterInput, DefaultModel, DefaultSortInput, Pagination, SortInput, StringFilterInput } from "@yumis-coconudge/common-module";

@ObjectType({ description: "커뮤니티 카테고리" })
export class CommunityCategory extends DefaultModel {
  @Field({ description: "커뮤니티 카테고리 이름" })
  name: string;

  @Field(() => Int, { description: "커뮤니티 카테고리 배치 순서", defaultValue: 1 })
  priority: number;

  @Field(type => Boolean, { description: "커뮤니티 카테고리 즐켜찾기 여부", defaultValue: false })
  isFavorite: boolean;
}

@ObjectType({ description: "커뮤니티 카테고리 목록" })
export class CommunityCategoryList extends Pagination(CommunityCategory) { }