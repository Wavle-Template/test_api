/**
 * @module UserModule
 */
import { Field, ObjectType } from "@nestjs/graphql";

/**
 * 사용자 알림 설정
 * @category GraphQL Object Type
 */
@ObjectType({ description: "사용자 알림 설정" })
export class UserNotificationSetting {
  /** 마케팅 알림 */
  @Field(returns => Boolean, { description: "마케팅 알림" })
  marketing: boolean;

  /** 키워드 알림 */
  @Field(returns => Boolean, { description: "키워드 알림" })
  keyword: boolean;

  /** 공지사항 알림 */
  @Field(returns => Boolean, { description: "공지사항 알림" })
  notice: boolean;

  /** 채팅 알림 */
  @Field(returns => Boolean, { description: "채팅 알림" })
  chat: boolean;

  /** 팔로우 알림 */
  @Field(returns => Boolean, { description: "팔로우 알림" })
  follow: boolean;

  /** 커뮤니티 게시글 알림 */
  @Field(returns => Boolean, { description: "커뮤니티 게시글 알림" })
  communityPost: boolean;

  /** 커뮤니티 댓글 알림 */
  @Field(returns => Boolean, { description: "커뮤니티 댓글 알림" })
  communityCommend: boolean;
}
