/**
 * @module UserModule
 */
import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs } from "@yumis-coconudge/common-module";
import { UserFilterInput, UserOrderInput } from "./user.input";

/**
 * 사용자 목록 페이지네이션 전용 인자
 * @category GraphQL Args Type
 */
@ArgsType()
export class UserListArgs extends MixedPaginationArgs(UserFilterInput, UserOrderInput) {}
