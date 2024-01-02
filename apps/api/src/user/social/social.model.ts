/**
 * @module UserSocialModule
 */
import { UserSocialType } from "@app/entity/user/social/social.enum";
import { Field, InputType, ObjectType } from "@nestjs/graphql";
import { EssentialModel } from "@yumis-coconudge/common-module";
import { UserCreateInput } from "../user.input";

/**
 * 사용자 소셜 서비스 연결
 * @category GraphQL Object Type
 */
@ObjectType({ description: "사용자 소셜 서비스 연결" })
export class UserSocialLink extends EssentialModel {
  /** 소셜 서비스 종류 */
  @Field(type => UserSocialType,{ description: "소셜 서비스 종류" })
  socialType: UserSocialType;

  /** 이메일 */
  @Field({ description: "이메일", nullable: true })
  email?: string;
}


/**
 * 사용자 소셜 회원가입 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "회원가입 데이터" })
export class SocialSignUpInput extends UserCreateInput {
}