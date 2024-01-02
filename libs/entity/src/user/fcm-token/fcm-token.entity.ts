/**
 * @module UserFCMTokenModule
 */
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { UserEntity } from "../user.entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";

/**
 * 사용자 FCM 토큰 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "user_fcm_tokens", orderBy: { updatedAt: "DESC", userId: "ASC", id: "ASC" } })
export class UserFCMTokenEntity extends DefaultEntity {
  /** FCM 등록 토큰 */
  @Column()
  fcmRegistrationToken: string;

  /** OS */
  @Column()
  os: string;

  /** 사용자 */
  @ManyToOne(type => UserEntity, user => user.fcmTokens, { onDelete: "SET NULL" })
  user: UserEntity;

  /** 사용자 ID */
  @RelationId((fcmToken: UserFCMTokenEntity) => fcmToken.user)
  userId: string;
}
