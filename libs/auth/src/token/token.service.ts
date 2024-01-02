/**
 * @module AuthModule
 */
import crypto from "crypto";
import { JsonWebTokenError } from "jsonwebtoken";
import { EntityManager } from "typeorm";
import { Injectable } from "@nestjs/common";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { InjectEntityManager } from "@nestjs/typeorm";
import { AuthTokenResponse } from "./response.interface";
import { AuthTokenPayload } from "./payload.interface";
import { ConfigService } from "@nestjs/config";
import { AuthTokenType } from "./token.enum";
import { AuthTokenBlacklistEntity } from "./token-blacklist.entity";
import { DateTime } from "luxon";

/**
 * 인증용 토큰을 발급 및 검사하기 위한 서비스입니다.
 * @category Provider
 */
@Injectable()
export class AuthTokenService {
  /** TypeORM 엔티티 매니저 */
  #entityManager: EntityManager;
  /** NestJS JWT 서비스 */
  #jwtService: JwtService;
  /** NestJS 컨픽 서비스 */
  #configService: ConfigService;
  /** 갱신 가능 시간(초)) */
  #availableRefreshTime: number;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   * @param jwtService  NestJS JWT 서비스
   * @param configService NestJS 컨픽 서비스
   */
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    jwtService: JwtService,
    configService: ConfigService,
  ) {
    this.#entityManager = entityManager;
    this.#jwtService = jwtService;
    this.#configService = configService;
    this.#availableRefreshTime = Math.floor(this.#configService.get<number>("JWT_REFRESH_TOKEN_EXPIRES_IN") / 2);
  }

  /**
   * 갱신 토큰(Refresh Token)을 갱신해도 되는지 검증합니다.
   * @param refreshToken 갱신 토큰(Refresh Token)
   * @returns 갱신 토큰 발급 가능 여부
   */
  isAvailableRefreshing(refreshToken: string): boolean {
    const payload = this.#jwtService.decode(refreshToken) as AuthTokenPayload;
    return DateTime.fromSeconds(payload.iat).diffNow().as("seconds") > this.#availableRefreshTime;
  }

  /**
   * 사용 중지된 갱신 토큰(Refresh Token)인지 검증합니다.
   * @param jwtId JWT ID
   * @param manager TypeORM 엔티티 매니저
   * @returns 사용 중지 여부
   */
  async isRevokedRefreshToken(jwtId: string, manager = this.#entityManager): Promise<boolean> {
    if ((await manager.count(AuthTokenBlacklistEntity, { id: jwtId })) > 0) return true;
    return false;
  }

  /**
   * 접근 토큰(Access Token)을 발급합니다.
   * @param id 사용자 ID
   * @param refreshJwtID 갱신 토큰(Refresh Token)의 JWT ID
   * @param audience 사용처 (예: com.example.app, https://example.com)
   * @returns 접근 토큰(Access Token)
   */
  generateAccessToken(id: string, refreshJwtID: string, audience?: string[]): string {
    const payload: Partial<AuthTokenPayload> = {
      type: AuthTokenType.AccessToken,
      id: id,
      parent: refreshJwtID,
    };
    const options: JwtSignOptions = {
      subject: id,
      jwtid: crypto.randomUUID(),
      expiresIn: this.#configService.get("JWT_REFRESH_TOKEN_EXPIRES_IN") * 1000,
    };
    if (audience != null) options.audience = audience;
    return this.#jwtService.sign(payload, options);
  }

  /**
   * 갱신 토큰(Refresh Token)을 발급합니다.
   * @param id 사용자 ID
   * @param audience 사용처 (예: com.example.app, https://example.com)
   * @returns 갱신 토큰(Refresh Token)
   */
  generateRefreshToken(id: string, audience?: string[]): string {
    const payload: Partial<AuthTokenPayload> = {
      type: AuthTokenType.RefreshToken,
      id: id,
    };
    const options: JwtSignOptions = {
      subject: id,
      jwtid: crypto.randomUUID(),
      expiresIn: this.#configService.get("JWT_REFRESH_TOKEN_EXPIRES_IN") * 1000,
    };
    if (audience != null) options.audience = audience;

    return this.#jwtService.sign(payload, options);
  }

  /**
   * [OAuth 2.0 표준](https://datatracker.ietf.org/doc/html/rfc6749#section-4.1.4)에 따른 응답 데이터를 생성합니다.
   * @param id 사용자 ID
   * @param refreshToken 갱신 토큰(Refresh Token)
   * @returns 응답 데이터
   */
  async generate(id: string, refreshToken = this.generateRefreshToken(id)): Promise<AuthTokenResponse> {
    const refreshTokenPayload = this.#jwtService.decode(refreshToken) as AuthTokenPayload;
    const accessToken = this.generateAccessToken(id, refreshTokenPayload.jti);

    return {
      token_type: "Bearer",
      access_token: accessToken,
      expires_in: this.#configService.get("JWT_ACCESS_TOKEN_EXPIRES_IN"),
      refresh_token: refreshToken,
    };
  }

  /**
   * 유효한 토큰인지 확인합니다.
   * @param jwt 토큰
   * @param type 토큰 타입
   * @returns 유효 여부
   */
  async validate(jwt: string, type?: AuthTokenType): Promise<boolean> {
    try {
      const payload = await this.#jwtService.verifyAsync<AuthTokenPayload>(jwt);
      if (type != null && payload.type !== type) return false;
      if (type === AuthTokenType.RefreshToken && (await this.isRevokedRefreshToken(payload.jti)) === true) return false;
      if (type === AuthTokenType.AccessToken && (await this.isRevokedRefreshToken(payload.parent)) === true)
        return false;

      return true;
    } catch (err) {
      if (err instanceof JsonWebTokenError) return false;
      else throw err;
    }
  }
}
