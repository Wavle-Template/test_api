/**
 * @module AuthModule
 */
import { UserEntity } from "@app/entity";
import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { UserState } from "@app/entity";
import { AuthTokenPayload } from "../token/payload.interface";
import { AuthTokenService } from "../token/token.service";
import { OpenGuard } from "./open.guard";
import { Request } from "./request.type";

/**
 * 유효한 JWT 토큰인지 검사하는 가드
 * @category Guard
 */
@Injectable()
export class JwtGuard extends OpenGuard {
  #entityManager: EntityManager;
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    public jwtService: JwtService, public authTokenService: AuthTokenService
  ) {
    super(jwtService, authTokenService)
    this.#entityManager = entityManager;
  }
  async validate(request: Request, token?: string): Promise<boolean> {
    if (token == null) return false;
    if ((await this.authTokenService.validate(token)) === false) {
      return false;
    }

    request.jwtPayload = this.jwtService.decode(token) as AuthTokenPayload;
    const info = await this.#entityManager.findOne(UserEntity, request.jwtPayload.id)
    if (info === null) {
      return false;
    } else if (info.state !== UserState.ACTIVE) {
      return false;
    }
    return true;
  }
}
