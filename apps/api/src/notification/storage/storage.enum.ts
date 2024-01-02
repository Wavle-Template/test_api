/**
 * @module NotificationStorageModule
 */
import { registerEnumType } from "@nestjs/graphql";

export enum NotificationStorageTargetType {
    /** 전체전송 */
    ALL = "ALL",
    /** 특정인원 */
    SPECIFIC = "SPECIFIC",
    /** ANDROID */
    ANDROID = "ANDORID",
    /** iOS */
    iOS = "iOS"
}

registerEnumType(NotificationStorageTargetType, {
    name: "NotificationStorageTargetType",
    description: "알림 타겟",
    valuesMap: {
        ALL: { description: "전체" },
        SPECIFIC: { description: "특정인원" },
        ANDROID: { description: "안드 유저만" },
        iOS: { description: "iOS유저만" }
    }
})