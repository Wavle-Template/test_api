/**
 * @module HashtagModule
 */
import { InputType, Field, PartialType } from "@nestjs/graphql";
import { StringFilterInput, SortInput, EssentialFilterInput, EssentialSortInput } from "@yumis-coconudge/common-module";

/**
 * 해시태그 생성 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "해시태그 생성" })
export class HashtagCreateInput {
  /** 내용 */
  @Field(type => String, { description: "내용" })
  keyword: string;
}

/**
 * 해시태그 수정 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "해시태그 수정" })
export class HashtagUpdateInput extends PartialType(HashtagCreateInput) {}

/**
 * 해시태그 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "해시태그 필터" })
export class HashtagFilterInput extends EssentialFilterInput {
  /** 내용 */
  @Field(type => [StringFilterInput], { description: "내용", nullable: true })
  keyword?: StringFilterInput[];
}

/**
 * 해시태그 정렬 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "해시태그 정렬" })
export class HashtagOrderInput extends EssentialSortInput {
  @Field(type => SortInput, { description: "내용", nullable: true })
  keyword?: SortInput;
}
