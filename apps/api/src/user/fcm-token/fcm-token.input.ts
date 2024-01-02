/**
 * @module UserFCMTokenModule
 */
import { Field, InputType } from "@nestjs/graphql";
import { FcmTokenOsEnum } from "./fcm-token.enum";

/**
 * 사용자 FCM 토큰 추가
 * @category GraphQL Input Type
 */
@InputType({ description: "사용자 FCM 토큰 추가" })
export class UserFCMTokenAddInput {
  /** FCM 등록 토큰 */
  @Field(type => String, { description: "FCM 등록 토큰" })
  fcmRegistrationToken: string;

  /** OS */
  @Field(type => FcmTokenOsEnum, { description: "OS" })
  os: FcmTokenOsEnum;
}
