/**
 * @module AuthModule
 */

/**
 * 토큰의 타입 (용도)
 * */
export enum AuthTokenType {
  /** 접근 토큰 (Access Token) */
  AccessToken = "ACCESS",
  /** 갱신 토큰 (Refresh Token) */
  RefreshToken = "REFRESH",
}
