/**
 * @module NotificationModule
 */
import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs, PaginationArgs } from "@yumis-coconudge/common-module";
import { NotificationFilterInput, NotificationSortInput } from "./notification.input";

/**
 * 알림 목록 단순 페이지네이션 전용 인자 (필터, 정렬 X)
 * @category GraphQL Args Type
 */
@ArgsType()
export class NotificationArgs extends PaginationArgs {}

/**
 * 알림 목록 페이지네이션 전용 인자
 * @category GraphQL Args Type
 */
@ArgsType()
export class NotificationMixedArgs extends MixedPaginationArgs(NotificationFilterInput, NotificationSortInput) {}
