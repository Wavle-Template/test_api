/**
 * @module UserModule
 */
import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Generated,
  Index,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from "typeorm";
import { UserFollowEntity } from "./follow/follow.entity";
import { UserFCMTokenEntity } from "./fcm-token/fcm-token.entity";
import { UserSocialEntity } from "./social/social.entity";
import { FileEntity } from "../file/file.entity";
import { UserBlockEntity } from "./block/block.entity";
import { UserNotificationSettingEntity } from "./notification-setting/notification-setting.entity";
import { UserProfileEntity } from "./profile/profile.entity";
import { UserState } from "./user.enum";

/**
 * 사용자 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "users", orderBy: { joinedAt: "DESC", id: "ASC" } })
export class UserEntity {
  /** UUID */
  @PrimaryGeneratedColumn("uuid")
  id: string;

  /** 고유번호(순번) */
  @Column({ unique: true })
  @Index()
  @Generated("increment")
  idx: number;

  /** 권한 타입 */
  @Column({ nullable: true })
  role?: string;

  /** 상태 */
  @Column({ nullable: true, default: UserState.ACTIVE })
  state?: string;

  /** 암호화용 솔트 */
  @Column({ nullable: true, select: false })
  salt?: string;

  /** 고유 이름(아이디) */
  @Column({ nullable: true })
  name?: string;

  /** 실명 */
  @Column({ nullable: true })
  realname?: string;

  /** 닉네임 */
  @Column({ nullable: true })
  nickname?: string;

  /** 비밀번호 */
  @Column({ nullable: true, select: false })
  password?: string;

  /** 이메일 */
  @Column({ nullable: true })
  email?: string;

  /** 전화번호 */
  @Column({ nullable: true })
  phoneNumber?: string;

  /** 딥링크 URL */
  @Column({ nullable: true })
  deepLinkURL?: string;

  /** 가입일 */
  @CreateDateColumn({ type: "timestamptz" })
  joinedAt: Date;

  /** 탈퇴일 */
  @DeleteDateColumn({ type: "timestamptz" })
  leavedAt?: Date;

  /** 마지막 로그인 날 */
  @Column("timestamptz", { nullable: true })
  lastLoginAt?: Date;

  /** 휴면 처리된 날 */
  @Column("timestamptz", { nullable: true })
  dormantAt?: Date;

  /** 탈퇴 후 개인정보 삭제 예정일 */
  @Column("timestamptz", { nullable: true })
  expireAt?: Date;

  /** 정지 처리된 날 */
  @Column("timestamptz", { nullable: true })
  suspendedAt?: Date;

  /** 정지 종료 날 */
  @Column("timestamptz", { nullable: true })
  suspendedEndAt?: Date;

  /** 정지 사유 */
  @Column({ nullable: true })
  suspendedReason?: string;

  /** 관리자 메모 */
  @Column({ nullable: true })
  adminMemo?: string;

  /** 프로필 */
  @Column(type => UserProfileEntity)
  profile: UserProfileEntity;

  /** 알림 설정 */
  @Column(type => UserNotificationSettingEntity)
  notificationSetting: UserNotificationSettingEntity;

  /** 소셜 로그인 */
  @OneToMany(type => UserSocialEntity, social => social.user, { nullable: true, onDelete: "SET NULL" })
  socials?: UserSocialEntity[];

  /** FCM 토큰 */
  @OneToMany(type => UserFCMTokenEntity, device => device.user, { nullable: true, onDelete: "SET NULL" })
  fcmTokens?: UserFCMTokenEntity[];

  /** 해당 사용자를 팔로우하는 사람 기록 */
  @OneToMany(type => UserFollowEntity, follow => follow.destination, { nullable: true, onDelete: "SET NULL" })
  followers?: UserFollowEntity[];

  /** 해당 사용자가 팔로우하는 사람 기록 */
  @OneToMany(type => UserFollowEntity, follow => follow.source, { nullable: true, onDelete: "SET NULL" })
  followees?: UserFollowEntity[];

  /** 해당 사용자를 차단하는 사람 기록 */
  @OneToMany(type => UserBlockEntity, block => block.destination, { nullable: true, onDelete: "SET NULL" })
  blockers?: UserBlockEntity[];

  /** 해당 사용자가 차단한 사람 기록 */
  @OneToMany(type => UserBlockEntity, block => block.source, { nullable: true, onDelete: "SET NULL" })
  blocks?: UserBlockEntity[];

  /** 프로필 사진 */
  @ManyToOne(type => FileEntity, { nullable: true, onDelete: "SET NULL" })
  avatar?: FileEntity;
}
