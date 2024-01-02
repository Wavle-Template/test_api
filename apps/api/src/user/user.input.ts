/**
 * @module UserModule
 */
import { Field, InputType, PartialType } from "@nestjs/graphql";
import { IsEmail, IsOptional, IsPhoneNumber, Matches, NotContains } from "class-validator";
import {
  DateTimeFilterInput,
  EnumFilterInputBase,
  IDFilterInput,
  IntFilterInput,
  IntSortInput,
  SortInput,
  SortInputBase,
  StringFilterInput,
  StringSortInput,
} from "@yumis-coconudge/common-module";
import { UserRole } from "@app/entity";
import { UserProfileUpdateInput } from "./profile/profile.input";
import { UserNotificationSettingUpdateInput } from "./notification-setting/notification-setting.input";

/**
 * 사용자 생성 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "사용자 생성 데이터" })
export class UserCreateInput {
  /** 고유 이름(아이디) */
  @Field(type => String, { nullable: true, description: "고유 이름(아이디)" })
  @IsOptional()
  @NotContains(" ", { message: "고유 이름에 공백을 사용할 수 없습니다." })
  @NotContains("\t", { message: "고유 이름에 탭을 사용할 수 없습니다." })
  @NotContains("\r", { message: "고유 이름에 엔터를 사용할 수 없습니다." })
  @NotContains("\n", { message: "고유 이름에 줄바꿈을 사용할 수 없습니다." })
  @Matches(/^[a-zA-Z0-9-_.]+$/, { message: "고유 이름에 특수 문자를 허용하지 않습니다." })
  name?: string;

  /** 실명 */
  @Field(type => String, { nullable: true, description: "실명" })
  @IsOptional()
  @NotContains("\t", { message: "실명에 탭을 사용할 수 없습니다." })
  @NotContains("\r", { message: "실명에 엔터를 사용할 수 없습니다." })
  @NotContains("\n", { message: "실명에 줄바꿈을 사용할 수 없습니다." })
  realname?: string;

  /** 닉네임 */
  @Field(type => String, { description: "닉네임" })
  @IsOptional()
  @NotContains("\t", { message: "닉네임에 탭을 사용할 수 없습니다." })
  @NotContains("\r", { message: "닉네임에 엔터를 사용할 수 없습니다." })
  @NotContains("\n", { message: "닉네임에 줄바꿈을 사용할 수 없습니다." })
  nickname?: string;

  /** 이메일 */
  @Field(type => String, { nullable: true, description: "이메일" })
  @IsOptional()
  @IsEmail(undefined, { message: "이메일 형식이 아닙니다." })
  email?: string;

  /** 전화번호 */
  @Field(type => String, { nullable: true, description: "전화번호" })
  @IsOptional()
  @IsPhoneNumber("KR", { message: "전화번호 형식이 아닙니다." })
  phoneNumber?: string;
}

/**
 * 사용자 회원가입 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "회원가입 데이터" })
export class SignUpInput extends UserCreateInput {
  /** 비밀번호 */
  @Field(type => String, { description: "비밀번호" })
  password: string;
}

/**
 * 사용자 수정 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "사용자 수정 데이터" })
export class UserUpdateInput extends PartialType(UserCreateInput) {
  @Field(type => UserProfileUpdateInput, { nullable: true })
  profile?: UserProfileUpdateInput;

  @Field(type => UserNotificationSettingUpdateInput, { nullable: true })
  notificationSetting?: UserNotificationSettingUpdateInput;
}

/**
 * 사용자 타입 필터
 * @category GraphQL Input Type
 */
@InputType({ description: "사용자 타입 필터" })
export class UserTypeFilterInput extends EnumFilterInputBase(UserRole) { }

/**
 * 사용자 필터 데이터
 * @category GraphQL Input Type
 */
@InputType({ description: "사용자 필터" })
export class UserFilterInput {
  /** UUID */
  @Field(type => [IDFilterInput], { nullable: true, description: "UUID" })
  id?: IDFilterInput[];

  /** 고유번호 */
  @Field(type => [IntFilterInput], { nullable: true, description: "고유번호" })
  idx?: IntFilterInput[];

  /** 권한 타입 */
  @Field(type => [UserTypeFilterInput], { nullable: true, description: "권한 타입" })
  role?: UserTypeFilterInput[];

  /** 고유 이름(아이디)) */
  @Field(type => [StringFilterInput], { nullable: true, description: "고유 이름(아이디)" })
  name?: StringFilterInput[];

  /** 이메일 */
  @Field(type => [StringFilterInput], { nullable: true, description: "이메일" })
  email?: StringFilterInput[];

  /** 전화번호 */
  @Field(type => [StringFilterInput], { nullable: true, description: "전화번호" })
  phoneNumber?: StringFilterInput[];

  /** 가입 날짜/시간 */
  @Field(type => [DateTimeFilterInput], { nullable: true, description: "가입 날짜/시간" })
  joinedAt?: DateTimeFilterInput[];

  /** 탈퇴 날짜/시간 */
  @Field(type => [DateTimeFilterInput], { nullable: true, description: "탈퇴 날짜/시간" })
  leavedAt?: DateTimeFilterInput[];

  /** 프로필 사진 파일 ID */
  @Field(type => [IDFilterInput], { nullable: true })
  avatar__id?: IDFilterInput[];
}

/**
 * 사용자 타입 정렬
 * @category GraphQL Input Type
 */
@InputType({ description: "사용자 타입 정렬" })
export class UserTypeSortInput extends SortInputBase<UserRole>(UserRole) { }

/**
 * 사용자 정렬
 * @category GraphQL Input Type
 */
@InputType({ description: "사용자 정렬" })
export class UserOrderInput {
  /** UUID */
  @Field(type => StringSortInput, { nullable: true, description: "UUID" })
  id?: StringSortInput;

  /** 고유번호 */
  @Field(type => IntSortInput, { nullable: true, description: "고유번호" })
  idx?: IntSortInput;

  /** 권한 타입 */
  @Field(type => UserTypeSortInput, { nullable: true, description: "권한 타입" })
  role?: UserTypeSortInput;

  /** 고유 이름(아이디) */
  @Field(type => StringSortInput, { nullable: true, description: "고유 이름(아이디)" })
  name?: StringSortInput;

  /** 이메일 */
  @Field(type => StringSortInput, { nullable: true, description: "이메일" })
  email?: StringSortInput;

  /** 전화번호 */
  @Field(type => StringSortInput, { nullable: true, description: "전화번호" })
  phoneNumber?: StringSortInput;

  /** 가입 날짜/시간 */
  @Field(type => SortInput, { nullable: true, description: "가입 날짜/시간" })
  joinedAt?: SortInput;

  /** 탈퇴 날짜/시간 */
  @Field(type => SortInput, { nullable: true, description: "탈퇴 날짜/시간" })
  leavedAt?: SortInput;
}
