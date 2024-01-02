/**
 * @module UserSocialModule
 */

/**
 * 소셜 로그인 서비스 인터페이스
 */
export interface IUserSocialLoginService {
  /**
   * 입력한 토큰이 해당 소셜 서비스에 유효한 토큰인지 확인합니다.
   * @param token 소셜 서비스 토큰
   * @returns 소셜 ID
   */
  validate(token: string): string | Promise<string> | never;
}
