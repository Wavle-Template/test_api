/**
 * @module NotificationModule
 */
import { NotificationType } from "@app/entity/notification/notification.enum";
import { Field, ID, ObjectType } from "@nestjs/graphql";
import { EssentialModel, Pagination } from "@yumis-coconudge/common-module";

/**
 * 알림 데이터
 * @category GraphQL Object Type
 */
@ObjectType({ description: "알림" })
export class Notification extends EssentialModel {
  @Field(type => String, { description: "제목", nullable: true })
  title?: string;

  @Field(type => String, { description: "메시지" })
  message: string;

  @Field(type => NotificationType, { description: "타입" })
  type: NotificationType;

  @Field(type => ID, { description: "연관 데이터의 ID (타입을 참고하여 사용)", nullable: true })
  relationId?: string;

  @Field(type => String, { description: "링크 URL 주소 (타입을 참고하여 사용)", nullable: true })
  url?: string;

  @Field(type => String, { description: "이미지 URL 주소", nullable: true })
  imageURL?: string;

  @Field(type => Boolean, { description: "관리자 임의 전송 여부", defaultValue: false })
  isCreatedForAdmin: boolean;
}

/**
 * 알림 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "알림 목록" })
export class NotificationList extends Pagination(Notification) {}
