/**
 * @module UserModule
 */
import { UserEntity } from "@app/entity";
import { BaseUserService } from "@app/user";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { USER_ROLE_METADATA } from "./role.const";

/**
 * 사용자 권한 체크를 위한 가드
 * @description JwtGuard와 같이 사용하세요.
 * @category Guard
 */
@Injectable()
export class UserRoleGuard implements CanActivate {
  /** 리플렉터 (메타데이터 처리) */
  #reflector: Reflector;
  /** 엔티티 매니저 */
  #entityManager: EntityManager;

  /**
   * @param reflector 리플렉터 (메타데이터 처리))
   * @param userService 사용자 서비스
   */
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    reflector: Reflector) {
    this.#reflector = reflector;
    this.#entityManager = entityManager;
  }

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextType = context.getType<GqlContextType>();
    const roles = this.#reflector.get<string[]>(USER_ROLE_METADATA, context.getHandler());

    switch (contextType) {
      case "http": {
        const jwtPayload = context.switchToHttp().getRequest().jwtPayload;
        if (jwtPayload == null) return false;
        const user = await this.#entityManager.findOne(UserEntity,jwtPayload.id);
        return roles.includes(user.role);
      }
      case "graphql": {
        const jwtPayload = GqlExecutionContext.create(context).getContext().req?.jwtPayload;
        if (jwtPayload == null) return false;
        const user = await this.#entityManager.findOne(UserEntity, jwtPayload.id);
        return roles.includes(user.role);
      }
    }

    return false;
  }
}
