/**
 * @module HashtagModule
 */
import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs } from "@yumis-coconudge/common-module";
import { HashtagFilterInput, HashtagOrderInput } from "./hashtag.input";

/**
 * 해시태그 목록 페이지네이션 전용 인자
 * @category GraphQL Args Type
 */
@ArgsType()
export class HashtagListArgs extends MixedPaginationArgs(HashtagFilterInput, HashtagOrderInput) {}
