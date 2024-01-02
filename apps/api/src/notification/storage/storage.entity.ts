/**
 * @module NotificationStorageModule
 */
import { UserEntity } from "@app/entity";
import { EssentialEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, JoinTable, ManyToMany, OneToMany } from "typeorm";
import { NotificationStorageTargetType } from "./storage.enum";

/**
 * 알림 저장소 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "notification_storages", orderBy: { createdAt: "DESC", id: "ASC" } })
export class NotificationStorageEntity extends EssentialEntity {
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

    /** 수신 타겟 */
    @Column({ nullable: true, default: NotificationStorageTargetType.ALL })
    target?: string;

    /** 특정 수신자 */
    @ManyToMany(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
    @JoinTable()
    recipients?: UserEntity[];

    /** 예약 시간, 30분 단위 ,null이면 즉시 */
    @Column("timestamptz", { nullable: true })
    scheduledAt?: Date;

    /** 발송 여뷰. */
    @Column({ default: false })
    isSend: boolean;
}
