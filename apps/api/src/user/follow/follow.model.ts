/**
 * @module UserFollowModule
 */
import { ObjectType } from "@nestjs/graphql";
import { EssentialModel, Pagination } from "@yumis-coconudge/common-module";

/**
 * 팔로우 기록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "팔로우 기록" })
export class UserFollow extends EssentialModel {}

/**
 * 팔로우 기록 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "팔로우 기록 목록" })
export class UserFollowList extends Pagination(UserFollow) {}
