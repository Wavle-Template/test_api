/**
 * @module NotificationModule
 */
import { NotificationType } from "@app/entity/notification/notification.enum";
import { Field, ID, InputType } from "@nestjs/graphql";
import {
  BooleanFilterInput,
  EnumFilterInputBase,
  EssentialFilterInput,
  EssentialSortInput,
  IDFilterInput,
  SortInput,
  SortInputBase,
  StringFilterInput,
} from "@yumis-coconudge/common-module";

/**
 * 알림 생성 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "알림 생성 데이터" })
export class NotificationCreateInput {
  /** 제목 */
  @Field(type => String, { nullable: true, description: "제목" })
  title?: string;

  /** 메시지 */
  @Field(type => String, { description: "메시지" })
  message: string;

  /** 타입 */
  @Field(type => NotificationType, { description: "타입" })
  type: NotificationType;

  /** 연관 데이터의 ID (타입을 참고하여 사용) */
  @Field(type => ID, { nullable: true, description: "연관 데이터의 ID (타입을 참고하여 사용)" })
  relationId?: string;

  /** 링크 URL 주소 (타입을 참고하여 사용) */
  @Field(type => String, { nullable: true, description: "링크 URL 주소 (타입을 참고하여 사용)" })
  url?: string;

  /** 이미지 URL 주소 */
  @Field(type => String, { nullable: true, description: "이미지 URL 주소" })
  imageURL?: string;

  /** 수신자 ID 목록 (없으면 해당 알림 타입 허용자에게 전부 발송) */
  @Field(type => [ID], { nullable: true, description: "수신자 ID 목록 (없으면 해당 알림 타입 허용자에게 전부 발송)" })
  recipientIds?: string[];
}

/**
 * 알림 타입 필터
 * @category GraphQL Input Type
 */
@InputType({ description: "알림 타입 필터" })
export class NotificationTypeFilterInput extends EnumFilterInputBase(NotificationType) {}

/**
 * 알림 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "알림 필터" })
export class NotificationFilterInput extends EssentialFilterInput {
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

  /** 관리자 임의 전송 여부 */
  @Field(type => [BooleanFilterInput], { nullable: true, description: "관리자 임의 전송 여부" })
  isCreatedForAdmin?: BooleanFilterInput[];

  /** 수신자 ID */
  @Field(type => [IDFilterInput], { nullable: true, description: "수신자 ID" })
  recipients__id?: IDFilterInput[];
}

/**
 * 알림 타입 정렬
 * @category GraphQL Input Type
 */
@InputType({ description: "알림 타입 정렬" })
export class NotificationTypeSortInput extends SortInputBase<NotificationType>(NotificationType) {}

/**
 * 알림 정렬 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "알림 정렬" })
export class NotificationSortInput extends EssentialSortInput {
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

  /** 관리자 임의 전송 여부 */
  @Field(type => SortInput, { nullable: true, description: "관리자 임의 전송 여부" })
  isCreatedForAdmin?: SortInput;

  /** 수신자 ID */
  @Field(type => SortInput, { nullable: true, description: "수신자 ID" })
  recipients__id?: SortInput;
}
