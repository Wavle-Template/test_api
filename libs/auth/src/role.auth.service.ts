/**
 * @module UserModule
 */
import { EntityManager } from "typeorm";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { UserEntity } from "@app/entity";
import { AuthService } from "@app/auth";
import { AuthTokenService } from "@app/auth/token/token.service";
import { AuthTokenResponse } from "@app/auth/token/response.interface";

/**
 * 사용자 정보를 이용하여 로그인과 같은 인증 작업을 수행하는 서비스
 * @category Provider
 */
@Injectable()
export class UserAuthService {
  /** TypeORM 엔티티 매니저 */
  #entityManager: EntityManager;
  /** 인증 서비스 */
  #authService: AuthService;
  /** 인증 토큰 서비스 */
  #authTokenService: AuthTokenService;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   * @param authService 인증 서비스
   * @param authTokenService 인증 토큰 서비스
   */
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    authService: AuthService,
    authTokenService: AuthTokenService,
  ) {
    this.#entityManager = entityManager;
    this.#authService = authService;
    this.#authTokenService = authTokenService;
  }

  /**
   * 아이디와 비밀번호로 로그인합니다. 로그인이 실패할 경우, null을 반환합니다.
   * @param username 아이디
   * @param password 비밀번호
   * @returns 토큰 정보
   */
  async loginNamePassword(username: string, password: string): Promise<AuthTokenResponse | null> {
    const user = await this.#entityManager.findOne(
      UserEntity,
      { name: username },
      { select: ["id", "salt", "name", "password"] },
    );
    if (user == null) return null;
    if (user.salt == null) return null;
    if (user.password == null) return null;
    if ((await this.#authService.comparePassword(password, Buffer.from(user.salt, "base64"), user.password)) === false)
      return null;

    await this.#entityManager.update(UserEntity, user.id, { lastLoginAt: new Date() })
    return await this.#authTokenService.generate(user.id);
  }

  /**
   * 이메일과 비밀번호로 로그인합니다. 로그인이 실패할 경우, null을 반환합니다.
   * @param email 이메일
   * @param password 비밀번호
   * @returns 토큰 정보
   */
  async loginEmailPassword(email: string, password: string): Promise<AuthTokenResponse | null> {
    const user = await this.#entityManager.findOne(
      UserEntity,
      { email: email },
      { select: ["id", "salt", "email", "password"] },
    );
    if (user == null) return null;
    if (user.salt == null) return null;
    if (user.password == null) return null;
    if ((await this.#authService.comparePassword(password, Buffer.from(user.salt, "base64"), user.password)) === false)
      return null;
    return await this.#authTokenService.generate(user.id);
  }
}
