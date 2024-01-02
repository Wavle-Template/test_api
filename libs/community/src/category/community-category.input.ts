import { Field, InputType, Int } from "@nestjs/graphql";
import { DefaultFilterInput, DefaultSortInput, SortInput, StringFilterInput } from "@yumis-coconudge/common-module";

@InputType({ description: "커뮤니티 카테고리 생성" })
export class CommunityCategoryCreateInput {
    @Field({ description: "커뮤니티 카테고리 이름" })
    name: string;

    @Field(() => Int, { description: "커뮤니티 카테고리 배치 순서", nullable: true, defaultValue: 1 })
    priority?: number;
}

@InputType({ description: "커뮤니티 카테고리 수정" })
export class CommunityCategoryUpdateInput {
    @Field({ description: "커뮤니티 카테고리 이름", nullable: true })
    name?: string;

    @Field(() => Int, { description: "커뮤니티 카테고리 배치 순서", nullable: true })
    priority?: number;
}

@InputType({ description: "커뮤니티 카테고리 필터링" })
export class CommunityCategoryFilterInput extends DefaultFilterInput {
    @Field(type => [StringFilterInput], { nullable: true, description: "이름" })
    name?: StringFilterInput[];
}

@InputType({ description: "커뮤니티 카테고리 정렬" })
export class CommunityCategoryOrderByInput extends DefaultSortInput {
    @Field(type => SortInput, { nullable: true, description: "이름" })
    name?: SortInput;

    @Field(type => SortInput, { nullable: true, description: "순서" })
    priority?: SortInput;
}
