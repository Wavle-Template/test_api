/**
 * @module NotificationStorageModule
 */

import { NotificationType } from "@app/entity/notification/notification.enum";
import { Field, GraphQLISODateTime, ID, InputType, PartialType } from "@nestjs/graphql";
import { BooleanFilterInput, DateTimeFilterInput, EnumFilterInputBase, EssentialFilterInput, EssentialSortInput, IDFilterInput, SortInput, StringFilterInput } from "@yumis-coconudge/common-module";
import { NotificationTypeFilterInput, NotificationTypeSortInput } from "../notification.input";
import { NotificationStorageTargetType } from "./storage.enum";


/**
 * 알림 저장소 생성 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "알림 저장소 생성 데이터" })
export class NotificationStorageCreateInput {
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
    @Field(_ => NotificationStorageTargetType, { description: "수신 타겟" })
    target: string;

    /** 예약 시간, 30분 단위 ,null이면 즉시 */
    @Field(_ => GraphQLISODateTime, { nullable: true, description: "예약 발송 시간, null이면 즉시" })
    scheduledAt?: Date;

    /** 발송 여뷰. */
    // @Field({ description: "전송 여부" })
    isSend: boolean;
}

/**
 * 알림 저장소 수정 데이터
 * @category GraphQL Input Type
 */
@InputType({description:"알림 저장소 수정 데이터"})
export class NotificationStorageUpdateInput extends PartialType(NotificationStorageCreateInput) { }

/**
 * 알림 저장소 타겟 필터
 * @category GraphQL Input Type
 */
@InputType({ description: "알림 저장소 타겟 필터" })
export class NotificationStorageTargetTypeFilterInput extends EnumFilterInputBase(NotificationStorageTargetType) { }

/**
 * 알림 저장소 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "알림 필터" })
export class NotificationStorageFilterInput extends EssentialFilterInput {
    /** 제목 */
    @Field(type => [StringFilterInput], { nullable: true, description: "제목" })
    title?: StringFilterInput[];

    /** 메시지 */
    @Field(type => [StringFilterInput], { nullable: true, description: "메시지" })
    message?: StringFilterInput[];

    /** 타입 */
    @Field(type => [NotificationTypeFilterInput], { nullable: true, description: "타입" })
    type?: NotificationTypeFilterInput[];

    /** 연관 데이터의 ID */
    @Field(type => [IDFilterInput], { nullable: true, description: "연관 데이터의 ID" })
    relationId?: IDFilterInput[];

    /** 링크 URL 주소 */
    @Field(type => [StringFilterInput], { nullable: true, description: "링크 URL 주소" })
    url?: StringFilterInput[];

    /** 이미지 URL 주소 */
    @Field(type => [StringFilterInput], { nullable: true, description: "이미지 URL 주소" })
    imageURL?: StringFilterInput[];

    /** 수신자 ID */
    @Field(type => [IDFilterInput], { nullable: true, description: "수신자 ID" })
    recipients__id?: IDFilterInput[];

    /** 수신 타겟 */
    @Field(type => [NotificationStorageTargetType], { nullable: true, description: "수신 타겟" })
    target?: NotificationStorageTargetType[];

    @Field(_ => [DateTimeFilterInput], { nullable: true, description: "예약 발송 시간" })
    scheduledAt?: DateTimeFilterInput[];

    @Field(_ => [BooleanFilterInput], { nullable: true, description: "전송 여부" })
    isSend?: BooleanFilterInput[]
}

/**
 * 알림 저장소 정렬 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "알림 저장소 정렬" })
export class NotificationStorageSortInput extends EssentialSortInput {
    /** 제목 */
    @Field(type => SortInput, { nullable: true, description: "제목" })
    title?: SortInput;

    /** 메시지 */
    @Field(type => SortInput, { nullable: true, description: "메시지" })
    message?: SortInput;

    /** 타입 */
    @Field(type => NotificationTypeSortInput, { nullable: true, description: "타입" })
    type?: NotificationTypeSortInput;

    /** 연관 데이터의 ID */
    @Field(type => SortInput, { nullable: true, description: "연관 데이터의 ID" })
    relationId?: SortInput;

    /** 링크 URL 주소 */
    @Field(type => SortInput, { nullable: true, description: "링크 URL 주소" })
    url?: SortInput;

    /** 이미지 URL 주소 */
    @Field(type => SortInput, { nullable: true, description: "이미지 URL 주소" })
    imageURL?: SortInput;

    /** 수신자 ID */
    @Field(type => SortInput, { nullable: true, description: "수신자 ID" })
    recipients__id?: SortInput;

    @Field(_ => [SortInput], { nullable: true, description: "예약 발송 시간" })
    scheduledAt?: SortInput[];
}