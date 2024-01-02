/**
 * 파이어베이스 어드민을 이용하여 푸시 알림을 보내거나 관리합니다.
 *
 * ## 다이어그램
 *
 * ```mermaid
 * classDiagram
 * ConfigModule --> FirebaseModule : Import
 * FirebaseModule o-- FirebaseAdmin : Provide
 * FirebaseModule o-- FirebaseCloudMessagingService : Provide
 * FirebaseModule o-- Logger : Provide
 * FirebaseCloudMessagingService <.. FirebaseAdmin : Inject
 * ```
 * @module FirebaseModule
 */
import admin from "firebase-admin";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { FIREBASE_ADMIN } from "./firebase.const";
import { FirebaseCloudMessagingService } from "./firebase-cloud-messaging.service";

/**
 * 파이어베이스 모듈
 * @hidden
 */
@Module({
  imports: [ConfigModule],
  providers: [
    {
      provide: Logger,
      useValue: new Logger(FirebaseModule.name),
    },
    {
      provide: FIREBASE_ADMIN,
      inject: [ConfigService, Logger],
      useFactory: (configService: ConfigService, logger: Logger) => {
        const firebaseAdminFilePath = configService.get("FIREBASE_ADMIN_FILE_PATH");
        if (firebaseAdminFilePath == null) {
          logger.warn("FIREBASE_ADMIN_FILE_PATH 환경변수가 없어서 Firebase Admin을 활성화하지 않습니다.");
          return;
        }

        const adminApp = admin.initializeApp({ credential: admin.credential.cert(firebaseAdminFilePath) });
        logger.log("Firebase Admin이 활성화되었습니다.");
        return adminApp;
      },
    },
    FirebaseCloudMessagingService,
  ],
  exports: [FIREBASE_ADMIN, FirebaseCloudMessagingService],
})
export class FirebaseModule {}
