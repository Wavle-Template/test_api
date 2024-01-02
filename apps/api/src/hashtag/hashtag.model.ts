/**
 * @module HashtagModule
 */
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { EssentialModel, Pagination } from "@yumis-coconudge/common-module";

/**
 * 해시태그
 * @category GraphQL Object Type
 */
@ObjectType({ description: "해시태그" })
export class Hashtag extends EssentialModel {
  /** 내용 */
  @Field(type => String, { description: "내용" })
  keyword: string;
}

/**
 * 해시태그 검색 결과
 * @category GraphQL Object Type
 */
@ObjectType({ description: "해시태그 검색 결과" })
export class HashtagSource {
  /** UUID */
  @Field(type => ID)
  id: string;

  /** 내용 */
  @Field(type => String, { description: "내용" })
  keyword: string;
}

/**
 * 해시태그 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "해시태그 목록" })
export class HashtagList extends Pagination(Hashtag) {}
