/**
 * 사용자 FCM 토큰을 관리하기 위한 모듈입니다.
 *
 * ### 다이어그램
 * ```mermaid
 * classDiagram
 * AuthModule --> UserFCMTokenModule : Import
 * UserFCMTokenModule o-- UserFCMTokenService : Provide
 * UserFCMTokenModule o-- UserFCMTokenLoader : Provide
 * UserFCMTokenModule o-- UserFCMTokenResolver : Provide
 * UserFCMTokenService <.. EntityManager : Inject
 * UserFCMTokenLoader <.. EntityManager : Inject
 * UserFCMTokenResolver <.. UserFCMTokenService : Inject
 * UserFCMTokenResolver <.. UserFCMTokenLoader : Inject
 * ```
 * @module UserFCMTokenModule
 */
import { Module } from "@nestjs/common";
import { AuthModule } from "@app/auth";
import { UserFCMTokenLoader } from "./fcm-token.loader";
import { UserFCMTokenResolver } from "./fcm-token.resolver";
import { UserFCMTokenService } from "./fcm-token.service";
import { FirebaseModule } from "@app/firebase";

/**
 * 사용자 FCM 토큰 모듈
 * @hidden
 */
@Module({
  imports: [AuthModule, FirebaseModule],
  providers: [UserFCMTokenService, UserFCMTokenLoader, UserFCMTokenResolver],
  exports: [UserFCMTokenService],
})
export class UserFCMTokenModule { }
