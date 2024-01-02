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

import { NotificationEntity } from "@app/entity/notification/notification.entity";
import { FirebaseModule } from "@app/firebase";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BaseNotificationService } from "./notification.service";

/**
 * 알림 모듈
 * @hidden
 */
@Module({
  imports: [TypeOrmModule.forFeature([NotificationEntity]), FirebaseModule],
  providers: [BaseNotificationService],
  exports: [BaseNotificationService],
})
export class BaseNotificationModule { }
