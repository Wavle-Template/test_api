/**
 * @module NotificationModule
 */
import { UserEntity } from "@app/entity";
import { EssentialEntity } from "@yumis-coconudge/common-module";
import { Entity, ManyToOne, RelationId } from "typeorm";
import { NotificationEntity } from "../notification.entity";

/**
 * 알림 읽음 기록 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "notification_reads", orderBy: { createdAt: "DESC", userId: "ASC", id: "ASC" } })
export class NotificationReadEntity extends EssentialEntity {
  /** 읽은 알림 */
  @ManyToOne(() => NotificationEntity, { onDelete: "SET NULL", nullable: true })
  notification?: NotificationEntity;

  /** 읽은 알림 ID */
  @RelationId((read: NotificationReadEntity) => read.notification)
  notificationId?: string;

  /** 읽은 사용자 */
  @ManyToOne(() => UserEntity, { onDelete: "SET NULL", nullable: true })
  user?: UserEntity;

  /** 읽은 사용자 ID */
  @RelationId((read: NotificationReadEntity) => read.user)
  userId?: string;
}
