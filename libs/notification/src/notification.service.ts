/**
 * @module NotificationModule
 */

import { UserEntity, UserFCMTokenEntity, UserNotificationSettingEntity } from "@app/entity";
import { NotificationEntity } from "@app/entity/notification/notification.entity";
import { NotificationType } from "@app/entity/notification/notification.enum";
import { FirebaseCloudMessagingService } from "@app/firebase";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService, EssentialEntity } from "@yumis-coconudge/common-module";
import { DeepPartial } from "ts-essentials";
import { EntityManager, FindConditions, In } from "typeorm";

/**
 * 알림을 관리하는 서비스
 * @category Provider
 */
@Injectable()
export class BaseNotificationService extends CRUDService<NotificationEntity> {
  /** Firebase Cloud Messaing 서비스 */
  #fcmService: FirebaseCloudMessagingService;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   * @param fcmService Firebase Cloud Messaing 서비스
   */
  constructor(@InjectEntityManager() entityManager: EntityManager, fcmService: FirebaseCloudMessagingService) {
    super(entityManager, NotificationEntity);
    this.#fcmService = fcmService;
  }

  /**
   * 특정 알림 타입을 허용하는 수신자를 찾습니다.
   * @param type 알림 타입
   * @param transactionManager 트랜잭션용 엔티티 매니저
   * @returns
   */
  async findRecipients(type: string, transactionManager?: EntityManager): Promise<UserEntity[]> {
    let typeConditions: FindConditions<UserNotificationSettingEntity>[] = [];
    switch (type) {
      case NotificationType.NOTICE:
        typeConditions.push({ notice: true });
        break;
      case NotificationType.MARKETING:
        typeConditions.push({ marketing: true });
        break;
      case NotificationType.KEYWORD:
        typeConditions.push({ keyword: true });
        break;
      case NotificationType.CHAT:
        typeConditions.push({ chat: true });
        break;
      case NotificationType.FOLLOW:
        typeConditions.push({ follow: true });
        break;
      case NotificationType.COMMUNITY_POST:
        typeConditions.push({ communityPost: true });
        break;
      case NotificationType.COMMUNITY_COMMEND:
        typeConditions.push({ communityCommend: true });
        break;
    }

    return await transactionManager.find(UserEntity, { where: { notificationSetting: typeConditions } });
  }

  /**
   * 단일 알림을 보냅니다. 하나의 알림을 여러명에게 보낼 수 있습니다.
   * @param data 생성할 알림 데이터
   * @returns FCM으로 전송된 알림 엔티티
   */
  async send(data: DeepPartial<Omit<NotificationEntity, keyof EssentialEntity>>, transactionManager?: EntityManager): Promise<NotificationEntity> {
    return this.useTransaction(async manager => {
      if (data.recipients == undefined || data.recipients.length <= 0) {
        data.recipients = await this.findRecipients(data.type, manager);
      }

      const notification = manager.create(NotificationEntity, data);
      await manager.save(notification);

      const fcmTokens = await manager.find(UserFCMTokenEntity, {
        where: { user: { id: In(data.recipients.map(recipient => recipient.id)) } },
      });

      if (fcmTokens.length < 0) return await manager.findOne(NotificationEntity, { id: notification.id });

      const registrationTokens = fcmTokens.map(fcmToken => fcmToken.fcmRegistrationToken);
      await this.#fcmService.sendMulticast(
        registrationTokens,
        {
          title: notification.title,
          body: notification.message,
          imageUrl: notification.imageURL,
        },
        {
          id: notification.id,
          type: notification.type,
          relationId: notification.relationId,
          url: notification.url,
        },
      );

      return await manager.findOne(NotificationEntity, { id: notification.id });
    }, transactionManager);
  }

}
