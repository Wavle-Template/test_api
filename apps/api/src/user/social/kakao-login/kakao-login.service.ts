/**
 * @module UserSocialKakaoLoginModule
 */

import { AxiosError } from "axios";
import { HttpException, Injectable, InternalServerErrorException, UnauthorizedException } from "@nestjs/common";
import { HttpService } from "@nestjs/axios";
import { IUserSocialLoginService } from "../social-login.interface";
import { KAKAO_API_URL, KAKAO_AUTH_URL } from "./kakao-login.const";
import { ConfigService } from "@nestjs/config";
import { AuthTokenResponse } from "@app/auth/token/response.interface";

/**
 * 카카오 계정으로 로그인하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class UserSocialKakaoLoginService implements IUserSocialLoginService {
  /** Http 서비스 */
  #httpService: HttpService;
  /** 컨픽 서비스 */
  #configService: ConfigService;

  /**
   * @param httpService Http 서비스
   * @param configService 컨픽 서비스
   */
  constructor(httpService: HttpService, configService: ConfigService) {
    this.#httpService = httpService;
    this.#configService = configService;
  }

  /**
   * 카카오 계정의 접근 토큰(Access Token)을 얻습니다.
   * @param code 인가 코드
   * @param redirectUri 리다이렉트 URI
   * @returns 응답받은 토큰
   */
  async getToken(code: string, redirectUri: string): Promise<AuthTokenResponse> {
    try {
      const url = new URL("/oauth/token", KAKAO_AUTH_URL).href;

      const tokenResponse = await new Promise<AuthTokenResponse>((resolve, reject) => {
        this.#httpService
          .post(
            url,
            new URLSearchParams({
              grant_type: "authorization_code",
              client_id: this.#configService.get("KAKAO_API_CLIENT_ID"),
              client_secret: this.#configService.get("KAKAO_API_CLIENT_SECRET"),
              code: code,
              redirect_uri: redirectUri,
            }),
            {
              headers: {
                "Content-Type": "application/x-www-form-urlencoded",
              },
            },
          )
          .subscribe({
            error: err => reject(err),
            next: response => resolve(response.data),
          });
      });

      return tokenResponse;
    } catch (e) {
      const err = e as AxiosError;
      if (this.#configService.get("NODE_ENV") !== "production")
        throw new HttpException(err.response.data, parseInt(err.code));
      else throw new InternalServerErrorException();
    }
  }

  /**
   * 해당 접근 토큰(Access Token)이 유효한지 확인하고 소셜 ID를 얻습니다.
   * @param token 접근 토큰(Access Token)
   * @returns 소셜 ID
   */
  async validate(token: string): Promise<string> {
    try {
      const url = new URL("/v1/user/access_token_info", KAKAO_API_URL).href;
      const infoResponse = await new Promise<{ id: string }>((resolve, reject) => {
        this.#httpService
          .get(url, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })
          .subscribe({
            error: err => reject(err),
            next: response => resolve(response.data),
          });
      });

      return infoResponse.id;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
