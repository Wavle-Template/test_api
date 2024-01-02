/**
 * @module UserModule
 */
import { Field, GraphQLISODateTime, ID, Int, InterfaceType, ObjectType } from "@nestjs/graphql";
import { UserDocument } from "./user.type";
import { Pagination } from "@yumis-coconudge/common-module";
import { AuthTokenResponse } from "@app/auth/token/response.model";
import { User } from "@app/user/user.model";


/**
 * 사용자 검색 결과
 * @category GraphQL Object Type
 */
@ObjectType({ description: "사용자 검색 결과" })
export class UserSearchResult implements UserDocument {
  @Field(type => ID, { description: "UUID" })
  id: string;

  @Field(type => Int, { description: "고유번호" })
  idx: number;

  @Field(type => String, { nullable: true, description: "고유 이름(아이디)" })
  name?: string;

  @Field(type => String, { nullable: true, description: "닉네임" })
  nickname?: string;
}

/**
 * 회원가입 결과
 * @category GraphQL Object Type
 */
@ObjectType({ description: "회원가입 결과" })
export class SignUpResult {
  @Field(type => User, { description: "사용자 정보" })
  user: User;

  @Field(type => AuthTokenResponse, { description: "토큰 정보" })
  token: AuthTokenResponse;
}

/**
 * 사용자 목록
 * @category GraphQL Object Type
 */
@ObjectType({ description: "사용자 목록" })
export class UserList extends Pagination(User) {}
