/**
 * @module NotificationStorageModule
 */

import { NotificationType } from "@app/entity/notification/notification.enum";
import { Field, GraphQLISODateTime, ID, ObjectType } from "@nestjs/graphql";
import { EssentialModel, Pagination } from "@yumis-coconudge/common-module";
import { NotificationStorageTargetType } from "./storage.enum";

/**
 * 알림 저장소
 * @category GraphQL Object Type
 */
@ObjectType({ description: "알림 저장소" })
export class NotificationStorageModel extends EssentialModel {
    /** 제목 */
    @Field({ nullable: true, description: "제목" })
    title?: string;

    /** 메시지 */
    @Field({ nullable: true, description: "내용" })
    message?: string;

    /** 타입 */
    @Field(_ => NotificationType, { nullable: true, description: "알림 타입" })
    type?: string;

    /** 연관 데이터의 ID (타입을 참고하여 사용) */
    @Field(_ => ID, { nullable: true, description: "연관 데이터의 ID" })
    relationId?: string;

    /** 링크 URL 주소 (타입을 참고하여 사용) */
    @Field({ nullable: true, description: "링크  URL주소" })
    url?: string;

    /** 이미지 URL 주소 */
    @Field({ nullable: true, description: "이미지  URL주소" })
    imageURL?: string;


    /** 수신 타겟 */
    @Field(_ => NotificationStorageTargetType, { nullable: true, description: "수신 타겟" })
    target?: string;

    /** 예약 시간, 30분 단위 ,null이면 즉시 */
    @Field(_ => GraphQLISODateTime, { nullable: true, description: "예약 발송 시간, null이면 즉시" })
    scheduledAt?: Date;

    /** 발송 여뷰. */
    @Field({ description: "전송 여부" })
    isSend: boolean;
}

/**
 * 알림 저장소 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "알림 저장소 목록" })
export class NotificationStorageList extends Pagination(NotificationStorageModel) { }
