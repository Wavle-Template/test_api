/**
 * @module UserSocialModule
 */
import { LastLoginService } from "@app/auth/last.login.service";
import { UserEntity, UserSocialEntity } from "@app/entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { DeepPartial } from "ts-essentials";
import { EntityManager } from "typeorm";
import { UserService } from "../user.service";
import { UserSocialType } from "@app/entity/user/social/social.enum";

/**
 * 사용자 소셜 연결 및 관리하기 위한 서비스입니다.
 * @category Provider
 */
@Injectable()
export class UserSocialService {
  /** TypeORM 엔티티 매니저 */
  #entityManager: EntityManager;
  /** 사용자 서비스 */
  #userService: UserService;
  #lastLoginService: LastLoginService;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   * @param userService 사용자 서비스
   */
  constructor(@InjectEntityManager() entityManager: EntityManager, userService: UserService, lastLoginService: LastLoginService) {
    this.#entityManager = entityManager;
    this.#userService = userService;
    this.#lastLoginService = lastLoginService;
  }

  /**
   * 소셜 ID를 통해 사용자 소셜 데이터를 찾습니다.
   * @param socialType 소셜 종류
   * @param socialId 소셜 ID
   * @returns 사용자 소셜 엔티티
   */
  async findOne(socialType: UserSocialType, socialId: string): Promise<UserSocialEntity> {
    return this.#entityManager.findOne(
      UserSocialEntity,
      { socialType: socialType, socialId: socialId },
      { relations: ["user"] },
    );
  }

  /**
   * 소셜 로그인으로 사용자를 생성합니다.
   * @param socialType 소셜 종류
   * @param socialId 소셜 ID
   * @param userData 생성할 사용자 데이터
   * @returns 생성된 사용자 소셜 엔티티
   */
  async createUser(
    socialType: UserSocialType,
    socialId: string,
    userData: DeepPartial<UserEntity>,
  ): Promise<UserEntity> {
    return this.#entityManager.transaction(async manager => {
      const user = await this.#userService.createOne(userData, manager);

      const userSocial = manager.create(UserSocialEntity, {
        socialType: socialType,
        socialId: socialId,
        user: user,
        email: user.email,
      });

      await manager.save(userSocial);
      return await manager.findOne(UserEntity, user.id);
    });
  }

  /**
   * 소셜 로그인을 사용자에게 연결합니다.
   * @param socialType 소셜 종류
   * @param socialId 소셜 ID
   * @param userId 사용자 ID
   * @param email 이메일
   * @returns 연결된 사용자 엔티티
   */
  async linkUser(socialType: UserSocialType, socialId: string, userId: string, email?: string): Promise<UserEntity> {
    return this.#entityManager.transaction(async manager => {
      const user = await manager.findOneOrFail(UserEntity, userId, { relations: ["socials"] });

      let userSocial = manager.create(UserSocialEntity, {
        socialType: socialType,
        socialId: socialId,
        user: user,
        email: email,
      });
      userSocial = await manager.save(userSocial);

      return await manager.findOne(UserEntity, user.id);
    });
  }

  /** 
   * 마지막 로그인 날짜갱신
   */
  async updateLastLoginAt(userId: string) {
    return this.#lastLoginService.updateLastLoginAt(userId)
  }
}
