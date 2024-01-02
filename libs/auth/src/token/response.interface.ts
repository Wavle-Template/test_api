/**
 * @module AuthModule
 */

/**
 * [OAuth 2.0 표준](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.4)에 따른 응답 데이터
 */
export interface AuthTokenResponse {
  /** 토큰 타입 */
  token_type: "Bearer";
  /** 접근 토큰 */
  access_token: string;
  /** 접근 토큰 만료 시간(초) */
  expires_in: number;
  /** 갱신 토큰 */
  refresh_token: string;
}
