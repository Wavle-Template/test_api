/**
 * @module NotificationStorageModule
 */
import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs, PaginationArgs } from "@yumis-coconudge/common-module";
import { NotificationStorageFilterInput, NotificationStorageSortInput } from "./storage.input";

// /**
//  * 알림 저장소 목록 단순 페이지네이션 전용 인자 (필터, 정렬 X)
//  * @category GraphQL Args Type
//  */
// @ArgsType()
// export class NotificationStorageArgs extends PaginationArgs { }

/**
 * 알림 저장소 목록 페이지네이션 전용 인자
 * @category GraphQL Args Type
 */
@ArgsType()
export class NotificationStorageArgs extends MixedPaginationArgs(NotificationStorageFilterInput, NotificationStorageSortInput) { }
