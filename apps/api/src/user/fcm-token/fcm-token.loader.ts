/**
 * @module UserFCMTokenModule
 */
import LRUCache from "lru-cache";
import DataLoader from "dataloader";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, In } from "typeorm";
import { AbstractTypeORMService } from "@yumis-coconudge/common-module";
import { UserEntity, UserFCMTokenEntity } from "@app/entity";

/**
 * 사용자 FCM 토큰의 ResolveField를 처리하기 위한 데이터 로더입니다.
 * @category Provider
 */
@Injectable()
export class UserFCMTokenLoader extends AbstractTypeORMService<UserFCMTokenEntity> {
  /** 사용자 데이터 로더 */
  #user: DataLoader<string, UserEntity>;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   */
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, UserFCMTokenEntity);

    this.#user = new DataLoader(
      async (tokenIds: string[]) => {
        const tokens = await this.entityManager.find(UserFCMTokenEntity, {
          where: { id: In(tokenIds) },
          select: ["id", "user"],
          relations: ["user"],
        });

        return tokenIds.map(id => tokens.find(block => block.id === id).user);
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );
  }

  /**
   * 특정 사용자 FCM 토큰의 사용자를 가져옵니다.
   * @param tokenId 토큰 ID
   * @returns 사용자 엔티티
   */
  async getUser(tokenId: string): Promise<UserEntity> {
    return this.#user.load(tokenId);
  }
}
