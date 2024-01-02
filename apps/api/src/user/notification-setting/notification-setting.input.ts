/**
 * @module UserModule
 */
import { Field, InputType } from "@nestjs/graphql";

/**
 * 사용자 알림 설정
 * @category GraphQL Object Type
 */
@InputType({ description: "사용자 알림 설정 수정" })
export class UserNotificationSettingUpdateInput {
    /** 마케팅 알림 */
    @Field(returns => Boolean, { description: "마케팅 알림",nullable:true })
    marketing?: boolean;

    /** 키워드 알림 */
    @Field(returns => Boolean, { description: "키워드 알림", nullable: true })
    keyword?: boolean;

    /** 공지사항 알림 */
    @Field(returns => Boolean, { description: "공지사항 알림", nullable: true })
    notice?: boolean;

    /** 채팅 알림 */
    @Field(returns => Boolean, { description: "채팅 알림", nullable: true })
    chat?: boolean;

    /** 팔로우 알림 */
    @Field(returns => Boolean, { description: "팔로우 알림", nullable: true })
    follow?: boolean;

    /** 커뮤니티 게시글 알림 */
    @Field(returns => Boolean, { description: "커뮤니티 게시글 알림", nullable: true })
    communityPost?: boolean;

    /** 커뮤니티 댓글 알림 */
    @Field(returns => Boolean, { description: "커뮤니티 댓글 알림", nullable: true })
    communityCommend?: boolean;
}
