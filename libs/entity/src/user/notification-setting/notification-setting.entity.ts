/**
 * @module UserModule
 */
import { Column } from "typeorm";

/**
 * 사용자 알림 설정 엔티티
 * @category TypeORM Entity
 */
export class UserNotificationSettingEntity {
  /** 마케팅 알림 */
  @Column({ nullable: true })
  marketing?: boolean;

  /** 키워드 알림 */
  @Column({ nullable: true })
  keyword?: boolean;

  /** 공지사항 알림 */
  @Column({ nullable: true })
  notice?: boolean;

  /** 채팅 알림 */
  @Column({ nullable: true })
  chat?: boolean;

  /** 팔로우 알림 */
  @Column({ nullable: true })
  follow?: boolean;

  /** 커뮤니티 게시글 알림 */
  @Column({ nullable: true })
  communityPost?: boolean;

  /** 커뮤니티 댓글 알림 */
  @Column({ nullable: true })
  communityCommend?: boolean;
}
