/**
 * @module UserBlockModule
 */
import { ObjectType } from "@nestjs/graphql";
import { EssentialModel, Pagination } from "@yumis-coconudge/common-module";
/**
 * 차단 기록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "차단 기록" })
export class UserBlock extends EssentialModel {}

/**
 * 차단 기록 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "차단 기록 목록" })
export class UserBlockList extends Pagination(UserBlock) {}
