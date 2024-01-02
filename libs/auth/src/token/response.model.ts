/**
 * @module AuthModule
 */
import { Field, Int, ObjectType } from "@nestjs/graphql";

/**
 * [OAuth 2.0 표준](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.4)에 따른 응답 데이터
 * @category GraphQL Object Type
 */
@ObjectType({ description: "토큰 요청의 대한 응답" })
export class AuthTokenResponse {
  /** 토큰 타입 */
  @Field(type => String, { description: "토큰 타입" })
  tokenType: "Bearer";

  /** 접근 토큰 */
  @Field(type => String, { description: "접근 토큰" })
  accessToken: string;

  /** 접근 토큰 만료 시간(초) */
  @Field(type => Int, { description: "접근 토큰 만료 시간(초)" })
  expiresIn: number;

  /** 갱신 토큰 */
  @Field(type => String, { description: "갱신 토큰" })
  refreshToken: string;
}
