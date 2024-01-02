/**
 * 사용자 소셜 서비스 연결을 관리하기 위한 모듈입니다.
 *
 * 이 모듈만으로는 공개되어있는 기능이 없습니다. 각 소셜 로그인별 기능이 필요합니다.
 *
 * ### 다이어그램
 *
 * ```mermaid
 * classDiagram
 * UserModule --> UserSocialModule : Import
 * UserSocialModule o-- UserSocialService : Provide
 * UserSocialService <.. EntityManager: Inject
 * UserSocialService <.. UserService: Inject
 * ```
 * @module UserSocialModule
 */
import { LastLoginService } from "@app/auth/last.login.service";
import { forwardRef, Module } from "@nestjs/common";
import { UserLoader } from "../user.loader";
import { UserModule } from "../user.module";
import { SocialResolver } from "./social.resolver";
import { UserSocialService } from "./social.service";

/**
 * 사용자 소셜 모듈
 * @hidden
 */
@Module({
  imports: [forwardRef(() => UserModule)],
  providers: [UserSocialService, LastLoginService, SocialResolver, UserLoader],
  exports: [UserSocialService],
})
export class UserSocialModule { }
