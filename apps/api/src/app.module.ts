/**
 * 앱 최상위 모듈입니다.
 *
 * ## 다이어그램
 * ```mermaid
 * classDiagram
 * direction LR
 * TypeOrmModule --> AppModule : Import
 * ConfigModule --> AppModule : Import
 * GraphQLModule --> AppModule : Import
 * ServeStaticModule --> AppModule : Import
 * FileModule --> AppModule : Import
 * UserModule --> AppModule : Import
 * UserBlockModule --> AppModule : Import
 * UserFCMTokenModule --> AppModule : Import
 * UserFollowModule --> AppModule : Import
 * UserSocialModule --> AppModule : Import
 * UserSocialKakaoLoginModule --> AppModule : Import
 * NotificationModule --> AppModule : Import
 * ChatModule --> AppModule : Import
 * HashtagModule --> AppModule : Import
 * AppModule o-- AppController : Provide
 * ```
 * @module AppModule
 */
import path from "path";
import { Logger, Module } from "@nestjs/common";
import { GraphQLModule } from "@nestjs/graphql";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AppController } from "./app.controller";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ApolloDriver } from "@nestjs/apollo";
import { FileApiModule } from "./file/file-api.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { UserModule } from "./user/user.module";
import { ForbiddenError } from "apollo-server-fastify";
import { NotificationModule } from "./notification/notification.module";
import { UserBlockModule } from "./user/block/block.module";
import { UserFCMTokenModule } from "./user/fcm-token/fcm-token.module";
import { UserFollowModule } from "./user/follow/follow.module";
import { AdminPostModule } from "./admin-post/admin-post.module";
import { InquireModule } from './inquire/inquire.module';
import SettingConfig from '@app/setting';
import { ReportModule } from "./report/report.module";
import { UserSocialModule } from "user/social/social.module";
import { UserSocialNaverLoginModule } from "user/social/naver-login/naver-login.module";
import { UserSocialKakaoLoginModule } from "user/social/kakao-login/kakao-login.module";
import { CommunityModule } from "@app/community";
import { ChatModule } from "@app/chat";
import { BusinessChatCommonModule } from "@app/b-chat/modules/b-chat-common.module";
import { FindPassByEmailModule } from "@app/find-account/business/email/find-account-email.module";
import { OneSidedMatchModule } from "@app/match/business/one-sided/one-sided-match.module";
import { PhoneAuthModule } from "@app/phone-auth";
import { ServiceManageModule } from "@app/service-manage";
/**
 * 앱 모듈
 * @hidden
 */
@Module({
    imports: [
        ConfigModule.forRoot({
            load: [SettingConfig]
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: async (configService: ConfigService) => {
                return {
                    type: configService.get("TYPEORM_CONNECTION"),
                    host: configService.get("TYPEORM_HOST"),
                    port: configService.get("TYPEORM_PORT"),
                    username: configService.get("TYPEORM_USERNAME"),
                    password: configService.get("TYPEORM_PASSWORD"),
                    database: configService.get("TYPEORM_DATABASE"),
                    logging: configService.get("TYPEORM_LOGGING"),
                    // entities: configService.get("TYPEORM_ENTITIES"),
                    synchronize: Boolean(configService.get("TYPEORM_SYNCHRONIZE")),
                    autoLoadEntities: true
                };
            }
        }),
        GraphQLModule.forRoot({
            driver: ApolloDriver,
            autoSchemaFile: "./app-schema.gql",
            installSubscriptionHandlers: true,
            context: context => context,
            formatError: error => {
                if (error.name === "ForbiddenError")
                    throw new ForbiddenError("권한이 없습니다.");
                if ("response" in error.extensions && error.extensions.response != null) {
                    const response = error.extensions.response as {
                        message: string | string[];
                    };
                    if (Array.isArray(response.message))
                        return { message: response.message.join("\n"), ...error };
                    return { message: response.message, ...error };
                }
                return error;
            }
        }),
        ServeStaticModule.forRootAsync({
            isGlobal: true,
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => [
                {
                    rootPath: path.join(process.cwd(), configService.get("FILE_UPLOAD_PATH")),
                    serveRoot: path.join("/", configService.get("FILE_URL_PREFIX"))
                },
            ]
        }),
        FileApiModule,
        UserModule,
        UserBlockModule,
        UserFCMTokenModule,
        UserFollowModule,
        NotificationModule,
        AdminPostModule,
        InquireModule,
        ReportModule,
        UserSocialModule,
        UserSocialNaverLoginModule,
        UserSocialKakaoLoginModule,
        CommunityModule,
        ChatModule,
        BusinessChatCommonModule,
        FindPassByEmailModule,
        OneSidedMatchModule,
        PhoneAuthModule,
        ServiceManageModule
    ],
    controllers: [AppController]
})
export class AppModule {
    constructor() {
        const logger: Logger = new Logger("Server Name");
        logger.debug("Api Server Start!!!");
    }
}
