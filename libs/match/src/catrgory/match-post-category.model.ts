import { ArgsType, Field, InputType, Int, ObjectType } from "@nestjs/graphql";
import { BooleanFilterInput, DefaultFilterInput, DefaultModel, DefaultSortInput, MixedPaginationArgs, Pagination, SortInput, StringFilterInput } from "@yumis-coconudge/common-module";

@ObjectType({ description: "매칭 카테고리" })
export class MatchPostCategory extends DefaultModel {
    @Field({ description: "매칭 카테고리 이름" })
    name: string;

    @Field(() => Int, { description: "매칭 카테고리 배치 순서", defaultValue: 1 })
    priority: number;

    @Field(type => Boolean, { description: "매칭 카테고리 즐켜찾기 여부", defaultValue: false })
    isFavorite: boolean;
}

@ObjectType({ description: "매칭 카테고리 목록" })
export class MatchPostCategoryList extends Pagination(MatchPostCategory) { }

@InputType({ description: "매칭 카테고리 생성" })
export class MatchPostCategoryCreateInput {
    @Field({ description: "매칭 카테고리 이름" })
    name: string;

    @Field(type => Int, { description: "매칭 카테고리 배치 순서", nullable: true, defaultValue: 1 })
    priority?: number;
}

@InputType({ description: "매칭 카테고리 수정" })
export class MatchPostCategoryUpdateInput {
    @Field({ description: "매칭 카테고리 이름", nullable: true })
    name?: string;

    @Field(type => Int, { description: "매칭 카테고리 배치 순서", nullable: true })
    priority?: number;
}

@InputType({ description: "매칭 카테고리 필터링" })
export class MatchPostCategoryFilterInput extends DefaultFilterInput {
    @Field(type => [StringFilterInput], { nullable: true, description: "이름" })
    name?: StringFilterInput[];

    @Field(type => [BooleanFilterInput], { nullable: true, description: "즐겨찾기 여부" })
    isFavorite: BooleanFilterInput[];
}

@InputType({ description: "매칭 카테고리 정렬" })
export class MatchPostCategoryOrderByInput extends DefaultSortInput {
    @Field(type => SortInput, { nullable: true, description: "이름" })
    name?: SortInput;

    @Field(type => SortInput, { nullable: true, description: "순서" })
    priority?: SortInput;
}

@ArgsType()
export class MatchPostCategoryListArgs extends MixedPaginationArgs(MatchPostCategoryFilterInput, MatchPostCategoryOrderByInput) { }