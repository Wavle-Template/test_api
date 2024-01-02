/**
 * @module AuthModule
 */

import type { AuthTokenType } from "./token.enum";

/**
 * 인증용 토큰 페이로드 내용
 * @description 이 모듈에서 사용되는 JWT 토큰의 페이로드 내용입니다.
 */
export interface AuthTokenPayload {
  /** 발급자 (https://api.example.com) */
  iss: string;
  /** 대상자 (UUID) */
  sub: string;
  /** 사용처 ([com.example.app, https://example.com]) */
  aud?: string[];
  /** 만료 시간 (Unix epoch time, 초단위) */
  exp: number;
  /** 발급 시간 (Unix epoch time, 초단위) */
  iat: number;
  /** 토큰 ID (UUID) */
  jti: string;
  /** 타입 (ACCESS, REFRESH) */
  type: AuthTokenType;
  /** 사용자 ID (UUID) */
  id: string;
  /** 부모 토큰 (갱신 토큰)  */
  parent?: string;
}
