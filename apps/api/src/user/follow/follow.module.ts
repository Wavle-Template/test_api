/**
 * 사용자 팔로우, 팔로워를 관리하기 위한 모듈입니다.
 *
 * ### 다이어그램
 * ```mermaid
 * classDiagram
 * AuthModule --> UserFollowModule : Import
 * UserFollowModule o-- UserFollowService : Provide
 * UserFollowModule o-- UserFollowLoader : Provide
 * UserFollowModule o-- UserFollowResolver : Provide
 * UserFollowService <.. EntityManager : Inject
 * UserFollowLoader <.. EntityManager : Inject
 * UserFollowResolver <.. UserFollowService : Inject
 * UserFollowResolver <.. UserFollowLoader : Inject
 * ```
 * @module UserFollowModule
 */
import { Module } from "@nestjs/common";
import { AuthModule } from "@app/auth";
import { UserFollowLoader } from "./follow.loader";
import { UserFollowResolver, UserFollowUserResolveField } from "./follow.resolver";
import { UserFollowService } from "./follow.service";

/**
 * 사용자 팔로우 모듈
 * @hidden
 */
@Module({
  imports: [AuthModule],
  providers: [UserFollowService, UserFollowLoader, UserFollowResolver, UserFollowUserResolveField],
  exports: [UserFollowService],
})
export class UserFollowModule { }
