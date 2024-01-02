/**
 * @module UserFCMTokenModule
 */
import { Field, ObjectType } from "@nestjs/graphql";
import { DefaultModel, Pagination } from "@yumis-coconudge/common-module";
import { FcmTokenOsEnum } from "./fcm-token.enum";

/**
 * 사용자 FCM 토큰
 * @category GraphQL Object Type
 */
@ObjectType({ description: "사용자 FCM 토큰" })
export class UserFCMToken extends DefaultModel {
  /** FCM 등록 토큰 */
  @Field(type => String, { description: "FCM 등록 토큰" })
  fcmRegistrationToken: string;

  /** FCM 등록 토큰 */
  @Field(type => FcmTokenOsEnum, { description: "OS" })
  os: FcmTokenOsEnum;
}

/**
 * 사용자 FCM 토큰 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "사용자 FCM 토큰 목록" })
export class UserFCMTokenList extends Pagination(UserFCMToken) {}
