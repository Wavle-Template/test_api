/**
 * @module UserSocialModule
 */
import { registerEnumType } from "@nestjs/graphql";

/**
 * 사용자 소셜 종류
 */
export enum UserSocialType {
  /** 카카오 */
  KAKAO = "KAKAO",
  /** 애플 */
  APPLE = "APPLE",
  /** 네이버 */
  NAVER = "NAVER",
}

registerEnumType(UserSocialType, {
  name: "UserSocialType",
  description: "사용자 소셜 종류",
  valuesMap: {
    KAKAO: { description: "카카오" },
    APPLE: { description: "애플" },
    NAVER: { description: "네이버" }
  },
});
