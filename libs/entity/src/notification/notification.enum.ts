/**
 * @module NotificationModule
 */

/** 알림 타입 */
export enum NotificationType {
    /** 공지사항 알림 */
    NOTICE = "NOTICE",
    /** 마케팅 알림 (이벤트, 광고 등)) */
    MARKETING = "MARKETING",
    /** 키워드 알림 */
    KEYWORD = "KEYWORD",
    /** 팔로우 알림 */
    FOLLOW = "FOLLOW",
    /** 채팅 알림 */
    CHAT = "CHAT",
    /** 문의 */
    INQUIRE = "INQUIRE",
    /** 커뮤니티 게시글 알림 */
    COMMUNITY_POST ="COMMUNITY_POST",
    /** 커뮤니티 게시글 댓글 */
    COMMUNITY_COMMEND ="COMMUNITY_COMMEND",
    /** 매칭 관련 */
    MATCH_POST = "MATCH_POST",
}