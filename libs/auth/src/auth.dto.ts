/**
 * @module AuthModule
 */
import { ApiProperty } from "@nestjs/swagger";
import { IsDefined, IsJWT } from "class-validator";
import { AuthTokenResponse } from "./token/response.interface";

/**
 * 토큰을 갱신하기 위해 필요한 데이터
 * @category DTO
 */
export class AuthRefreshDto {
  @IsDefined({ message: "갱신 토큰이 필요합니다." })
  @IsJWT({ message: "JWT 토큰 형식이 아닙니다." })
  @ApiProperty({ description: "갱신 토큰" })
  refresh_token: string;
}

/**
 * [OAuth 2.0 표준](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.4)에 따른 응답 데이터
 */
export class AuthTokenResponseDto implements AuthTokenResponse {
  /** 토큰 타입 */
  @ApiProperty({ description: "토큰 타입", example: "Bearer" })
  token_type: "Bearer";

  /** 접근 토큰 */
  @ApiProperty({ description: "접근 토큰" })
  access_token: string;

  /** 접근 토큰 만료 시간(초) */
  @ApiProperty({ description: "접근 토큰 만료 시간(초)" })
  expires_in: number;

  /** 갱신 토큰 */
  @ApiProperty({ description: "갱신 토큰" })
  refresh_token: string;
}
