/**
 * 카카오 계정으로 로그인하기 위한 모듈입니다.
 *
 * ### 다이어그램
 * ```mermaid
 * classDiagram
 * ConfigModule --> UserSocialKakaoLoginModule : Import
 * HttpModule --> UserSocialKakaoLoginModule : Import
 * AuthModule --> UserSocialKakaoLoginModule : Import
 * UserSocialModule --> UserSocialKakaoLoginModule : Import
 * UserSocialKakaoLoginModule o-- UserSocialKakaoLoginService : Provide
 * UserSocialKakaoLoginModule o-- UserSocialKakaoLoginResolver : Provide
 * UserSocialKakaoLoginService <.. HttpService : Inject
 * UserSocialKakaoLoginService <.. ConfigService : Inject
 * UserSocialKakaoLoginResolver <.. ConfigService : Inject
 * UserSocialKakaoLoginResolver <.. UserSocialKakaoLoginService : Inject
 * UserSocialKakaoLoginResolver <.. UserSocialService : Inject
 * UserSocialKakaoLoginResolver <.. AuthTokenService : Inject
 * ```
 * @module UserSocialKakaoLoginModule
 */

import { HttpModule } from "@nestjs/axios";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthModule } from "@app/auth";
import { UserSocialModule } from "../social.module";
import { UserSocialKakaoLoginResolver } from "./kakao-login.resolver";
import { UserSocialKakaoLoginService } from "./kakao-login.service";

/**
 * 사용자 소셜 카카오 로그인 모듈
 * @hidden
 */
@Module({
  imports: [ConfigModule, HttpModule, AuthModule, UserSocialModule],
  providers: [UserSocialKakaoLoginService, UserSocialKakaoLoginResolver],
  exports: [UserSocialKakaoLoginService],
})
export class UserSocialKakaoLoginModule {
  constructor(configService: ConfigService) {
    const clientId = configService.get("KAKAO_API_CLIENT_ID");
    if (clientId == null) throw new Error("KAKAO_API_CLIENT_ID가 없습니다.");
  }
}
