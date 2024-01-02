/**
 * @module NotificationModule
 */

import { NotificationEntity } from "@app/entity/notification/notification.entity";
import { NotificationReadEntity } from "@app/entity/notification/read/read.entity";
import { FirebaseCloudMessagingService } from "@app/firebase";
import { BaseNotificationService } from "@app/notification";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { getEdges, getPageInfo } from "@yumis-coconudge/common-module";
import { Edge, PageInfo, PaginationArgs } from "@yumis-coconudge/typeorm-helper";
import { EntityManager } from "typeorm";

/**
 * 알림을 관리하는 서비스
 * @category Provider
 */
@Injectable()
export class NotificationService extends BaseNotificationService {
  /** Firebase Cloud Messaing 서비스 */
  #fcmService: FirebaseCloudMessagingService;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   * @param fcmService Firebase Cloud Messaing 서비스
   */
  constructor(@InjectEntityManager() entityManager: EntityManager, fcmService: FirebaseCloudMessagingService) {
    super(entityManager, fcmService);
    this.#fcmService = fcmService;
  }


  // async sendMany(datas: DeepPartial<Omit<NotificationEntity, keyof RecordEntity>>[]): Promise<NotificationEntity[]> {
  //   throw new Error("Method not implemented.");
  // }

  /**
   * 알림을 읽음 처리 합니다.
   * @param userId 사용자 ID
   * @param notificationId 알림 ID
   * @returns 읽음 처리된 알림 엔티티
   */
  async read(userId: string, notificationId: string): Promise<NotificationEntity> {
    return this.useTransaction(async manager => {
      const notificationRead = manager.create(NotificationReadEntity, {
        user: { id: userId },
        notification: { id: notificationId },
      });
      await manager.save(notificationRead);
      return await manager.findOne(NotificationEntity, { id: notificationId });
    });
  }

  /**
   * 특정 사용자의 알림 개수를 조회합니다.
   * @param userId 사용자 ID
   * @param unreadOnly 읽지 않은 알림만 조회할 것인지 여부
   * @returns 알림 개수
   */
  async countByUserId(userId: string, unreadOnly?: boolean): Promise<number> {
    if (unreadOnly === true) {
      return await this.getQueryBuilder("notifications")
        .leftJoin("notifications.recipients", "recipients")
        .where("recipients.id = :userId", { userId: userId })
        .andWhere(qb => {
          const subQuery = qb
            .subQuery()
            .from(NotificationReadEntity, "notification_reads")
            .where("notification_reads.userId = recipients.id")
            .andWhere("notification_reads.notificationId = notifications.id")
            .getQuery();
          return `NOT EXISTS (${subQuery})`;
        })
        .getCount();
    }

    return await this.entityManager.count(NotificationEntity, { where: { recipients: { id: userId } } });
  }

  /**
   * 특정 사용자 기준으로 페이지네이션을 해서 알림 목록을 가져옵니다.
   * @param userId 사용자 ID
   * @param args 페이지네이션 인자
   * @param unreadOnly 읽지 않은 알림만 조회할 것인지 여부
   * @returns 알림 목록
   */
  async getEdgesByUserId(
    userId: string,
    args: PaginationArgs,
    unreadOnly?: boolean,
  ): Promise<Edge<NotificationEntity>[]> {
    let builder = this.getQueryBuilder("notifications")
      .leftJoin("notifications.recipients", "recipients")
      .where("recipients.id = :userId", { userId: userId });

    if (unreadOnly === true) {
      builder.andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .from(NotificationReadEntity, "notification_reads")
          .where("notification_reads.userId = recipients.id")
          .andWhere("notification_reads.notificationId = notifications.id")
          .getQuery();
        return `NOT EXISTS (${subQuery})`;
      });
    }

    return await getEdges(builder, args);
  }

  /**
   * 특정 사용자 기준으로 페이지네이션을 통해 얻은 목록의 정보를 가져옵니다.
   * @param userId 사용자 ID
   * @param edges 알림 목록
   * @param args 페이지네이션 인자
   * @param unreadOnly 읽지 않은 알림만 조회할 것인지 여부
   * @returns 알림 목록 정보
   */
  async getPageInfoByUserId(
    userId: string,
    edges: Edge<NotificationEntity>[],
    args: PaginationArgs,
    unreadOnly?: boolean,
  ): Promise<PageInfo> {
    let builder = this.getQueryBuilder("notifications")
      .leftJoin("notifications.recipients", "recipients")
      .where("recipients.id = :userId", { userId: userId });

    if (unreadOnly === true) {
      builder.andWhere(qb => {
        const subQuery = qb
          .subQuery()
          .from(NotificationReadEntity, "notification_reads")
          .where("notification_reads.userId = recipients.id")
          .andWhere("notification_reads.notificationId = notifications.id")
          .getQuery();
        return `NOT EXISTS (${subQuery})`;
      });
    }

    return await getPageInfo(builder, edges, args);
  }
}
