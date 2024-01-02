import { ArgsType, Field, InputType, ObjectType } from "@nestjs/graphql";
import { DefaultFilterInput, DefaultModel, DefaultSortInput, MixedPaginationArgs, Pagination, SortInput, StringFilterInput } from "@yumis-coconudge/common-module";

@ObjectType({ description: "매칭 게시물 타입" })
export class MatchPostType extends DefaultModel {
    @Field({ description: "매칭 게시물 타입 이름" })
    name: string;
}

@ObjectType({ description: "매칭 게시물 타입 목록" })
export class MatchPostTypeList extends Pagination(MatchPostType) { }

@InputType({ description: "매칭 게시물 타입 생성" })
export class MatchPostTypeCreateInput {
    @Field({ description: "매칭 게시물 타입 이름" })
    name: string;
}

@InputType({ description: "매칭 게시물 타입 생성" })
export class MatchPostTypeUpdateInput {
    @Field({ description: "매칭 게시물 타입 이름" })
    name?: string;
}

@InputType({ description: "매칭 게시물 타입 필터링" })
export class MatchPostTypeFilterInput extends DefaultFilterInput {
    @Field(type => [StringFilterInput], { nullable: true, description: "이름" })
    name?: StringFilterInput[];
}

@InputType({ description: "매칭 게시물 타입 정렬" })
export class MatchPostTypeOrderByInput extends DefaultSortInput {
    @Field(type => SortInput, { nullable: true, description: "이름" })
    name?: SortInput;
}

@ArgsType()
export class MatchPostTypeListArgs extends MixedPaginationArgs(MatchPostTypeFilterInput, MatchPostTypeOrderByInput) { }