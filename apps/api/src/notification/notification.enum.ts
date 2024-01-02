/**
 * @module NotificationModule
 */
import { NotificationType } from "@app/entity/notification/notification.enum";
import { registerEnumType } from "@nestjs/graphql";


registerEnumType(NotificationType, {
  name: "NotificationType",
  valuesMap: {
    NOTICE: { description: "공지사항 알림" },
    MARKETING: { description: "마케팅 알림 (이벤트, 광고 등)" },
    KEYWORD: { description: "키워드 알림" },
    FOLLOW: { description: "팔로우 알림" },
    CHAT: { description: "채팅 알림" },
    INQUIRE: { description: "문의 관련 알림" }
  },
});
