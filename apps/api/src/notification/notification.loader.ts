/**
 * @module NotificationModule
 */
import LRUCache from "lru-cache";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import { EntityManager, In } from "typeorm";
import { NotificationReadEntity } from "@app/entity/notification/read/read.entity";

/**
 * 알림 Resolve Field 처리를 위한 데이터 로더
 * @category Provider
 */
@Injectable()
export class NotificationLoader {
  #entityManager: EntityManager;
  #isRead: DataLoader<{ notificationId: string; userId: string }, boolean>;

  constructor(@InjectEntityManager() entityManager: EntityManager) {
    this.#entityManager = entityManager;
    this.#isRead = new DataLoader(
      async (keys: { notificationId: string; userId: string }[]) => {
        const notificationIds = keys.map(key => key.notificationId);
        const userIds = keys.map(key => key.userId);
        const reads = await this.#entityManager.find(NotificationReadEntity, {
          where: { notification: { id: In(notificationIds) }, user: { id: In(userIds) } },
        });

        return keys.map(key =>
          reads.some(read => read.notification.id === key.notificationId && read.user.id === key.userId),
        );
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );
  }

  isRead(notificationId: string, userId: string): Promise<boolean> {
    return this.#isRead.load({ notificationId, userId });
  }
}
