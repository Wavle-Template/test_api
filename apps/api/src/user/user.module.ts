/**
 * 사용자를 관리하기 위한 모듈입니다.
 *
 * ### 다이어그램
 * ```mermaid
 * classDiagram
 * AuthModule --> UserModule : Import
 * SearchModule --> UserModule : Import
 * UserModule o-- UserAuthService : Provide
 * UserModule o-- UserService : Provide
 * UserModule o-- UserLoader : Provide
 * UserModule o-- UserResolver : Provide
 * UserModule o-- UserAdminResolver : Provide
 * UserModule o-- UserController : Provide
 * UserAuthService <.. EntityManager : Inject
 * UserAuthService <.. AuthService : Inject
 * UserAuthService <.. AuthTokenService : Inject
 * UserService <.. EntityManager : Inject
 * UserService <.. AuthService : Inject
 * UserService <.. SearchService : Inject
 * UserLoader <.. EntityManager : Inject
 * UserResolver <.. UserService : Inject
 * UserResolver <.. UserAuthService : Inject
 * UserResolver <.. AuthTokenService : Inject
 * UserController <.. UserAuthService : Inject
 * ```
 * @module UserModule
 */
import { AuthModule } from "@app/auth";
import { UserAuthService } from "@app/auth/role.auth.service";
import { FileEntityModule } from "@app/entity";
import { UserEntityModule } from "@app/entity/user/user.entity.module";
import { Module, OnModuleInit } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { UserAdminResolver } from "./user.admin.resolver";
import { USER_ELASTICSEARCH_INDEX_NAME } from "./user.const";
import { UserController } from "./user.controller";
import { UserLoader } from "./user.loader";
import { UserResolver } from "./user.resolver";
import { UserService } from "./user.service";
import SettingConfig from '@app/setting'
import { ScheduleModule } from "@nestjs/schedule";
import { UserSuspendedLogService } from "./suspended-log/suspended-log.service";
import { UserScheduleService } from "./user.schedule.service";
import { SleeperService } from "./sleeper/sleeper.service";
import { UserArchiveService } from "./archive/user-archive.service";
import { PhoneAuthBasicModule } from "@app/phone-auth/phone-auth-basic.module";
import { PhoneNumber } from "@yumis-coconudge/common-module";
import { SearchModule, SearchService } from "@app/search";

/**
 * 사용자 모듈
 * @hidden
 */
@Module({
  imports: [
    ConfigModule.forRoot({
      load: [SettingConfig]
    }),
    AuthModule, SearchModule, UserEntityModule, FileEntityModule,
    ScheduleModule.forRoot(),
    PhoneAuthBasicModule, PhoneNumber
  ],
  providers: [UserAuthService, UserService, UserLoader, UserResolver, UserAdminResolver, UserSuspendedLogService, UserScheduleService, SleeperService, UserArchiveService],
  controllers: [UserController],
  exports: [UserService, UserEntityModule, FileEntityModule],
})
export class UserModule implements OnModuleInit {
  #searchService: SearchService;

  constructor(searchService: SearchService) {
    this.#searchService = searchService;
  }

  async onModuleInit(): Promise<void> {
    if ((await this.#searchService.existsIndex(USER_ELASTICSEARCH_INDEX_NAME)) === true) return;

    const isOk = await this.#searchService.createIndex(USER_ELASTICSEARCH_INDEX_NAME, {
      properties: {
        id: undefined,
        name: { type: "text" },
        nickname: { type: "text", analyzer: "edge_ngram_analyzer", fielddata: true },
        idx: {
          type: "text",
          analyzer: "standard",
        },
      },
    });

    if (isOk === false)
      throw new Error(`일라스틱 서치에서 ${USER_ELASTICSEARCH_INDEX_NAME} 인덱스를 생성하는데 실패하였습니다.`);
  }
}
