/**
 * @module NotificationModule
 */
import { UserEntity } from "@app/entity";
import { EssentialEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { NotificationReadEntity } from "./read/read.entity";

/**
 * 알림 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "notifications", orderBy: { createdAt: "DESC", id: "ASC" } })
export class NotificationEntity extends EssentialEntity {
  /** 제목 */
  @Column({ nullable: true })
  title?: string;

  /** 메시지 */
  @Column({ nullable: true })
  message?: string;

  /** 타입 */
  @Column({ nullable: true })
  type?: string;

  /** 연관 데이터의 ID (타입을 참고하여 사용) */
  @Column({ nullable: true })
  relationId?: string;

  /** 링크 URL 주소 (타입을 참고하여 사용) */
  @Column({ nullable: true })
  url?: string;

  /** 이미지 URL 주소 */
  @Column({ nullable: true })
  imageURL?: string;

  /** 관리자 임의 전송 여부 */
  @Column({ default: false })
  isCreatedForAdmin: boolean;

  /** 수신자 */
  @ManyToMany(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinTable()
  recipients?: UserEntity[];

  /** 읽은 기록 */
  @OneToMany(type => NotificationReadEntity, read => read.notification, { nullable: true, onDelete: "SET NULL" })
  reads?: NotificationReadEntity[];
}
