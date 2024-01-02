/**
 * FCM을 이용해 알림을 보내고 알림을 관리하기 위한 모듈입니다.
 *
 * ## 다이어그램
 * ```mermaid
 * classDiagram
 * AuthModule --> NotificationModule : Import
 * FirebaseModule --> NotificationModule : Import
 * UserModule --> NotificationModule : Import
 * NotificationStorageModule --> NotificationModule : Import
 * NotificationModule o-- NotificationService : Provide
 * NotificationModule o-- NotificationLoader : Provide
 * NotificationModule o-- NotificationResolver : Provide
 * NotificationService <.. EntityManager : Inject
 * NotificationService <.. FirebaseCloudMessagingService : Inject
 * NotificationLoader <.. EntityManager : Inject
 * NotificationResolver <.. NotificationService : Inject
 * NotificationResolver <.. NotificationLoader : Inject
 * NotificationResolver <.. UserService : Inject
 * ```
 * @module NotificationModule
 */

import { AuthModule } from "@app/auth";
import { NotificationEntity } from "@app/entity/notification/notification.entity";
import { NotificationReadEntity } from "@app/entity/notification/read/read.entity";
import { FirebaseModule } from "@app/firebase";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import Redis from "ioredis";
import { UserModule } from "../user/user.module";
import { NOTIFICATION_UN_READ_REDIS, NOTIFICATION_UN_READ_REDIS_DB_INDEX } from "./notification.const";
import { NotificationLoader } from "./notification.loader";
import { NotificationResolver } from "./notification.resolver";
import { NotificationService } from "./notification.service";
import { NotificationStorageModule } from './storage/storage.module';

/**
 * 알림 모듈
 * @hidden
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([NotificationEntity, NotificationReadEntity]),
    AuthModule,
    ConfigModule,
    FirebaseModule,
    UserModule,
    NotificationStorageModule
  ],
  providers: [
    NotificationService,
    NotificationLoader,
    NotificationResolver,
    {
      provide: NOTIFICATION_UN_READ_REDIS,
      useFactory: (configService: ConfigService) => {
        const redisURL = configService.get<string>("REDIS_URL");
        const splitRedistURL = redisURL.split(":");
        return new Redis({
          host: splitRedistURL[0],
          port: Number(splitRedistURL[1]),
          db: NOTIFICATION_UN_READ_REDIS_DB_INDEX
        })
      },
      inject: [ConfigService],
    }
  ],
  exports: [NotificationService],
})
export class NotificationModule { }
