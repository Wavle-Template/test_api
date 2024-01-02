/**
 * @module UserBlockModule
 */
import LRUCache from "lru-cache";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { AbstractTypeORMService } from "@yumis-coconudge/common-module";
import DataLoader from "dataloader";
import { EntityManager, In } from "typeorm";
import { UserBlockEntity, UserEntity } from "@app/entity";

/**
 * 사용자 차단 ResolveField를 처리하기 위한 데이터 로더
 * @category Provider
 */
@Injectable()
export class UserBlockLoader extends AbstractTypeORMService<UserBlockEntity> {
  /** 사용자 데이터 로더 */
  #destinationUser: DataLoader<string, UserEntity>;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   */
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, UserBlockEntity);

    this.#destinationUser = new DataLoader(
      async (blockIds: string[]) => {
        const blocks = await this.entityManager.find(UserBlockEntity, {
          where: { id: In(blockIds) },
          select: ["id", "destination"],
          relations: ["destination"],
        });

        return blockIds.map(id => blocks.find(block => block.id === id).destination);
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );
  }

  /**
   * 특정 차단의 차단한 사용자를 가져옵니다.
   * @param blockId 차단 ID
   * @returns 사용자 엔티티
   */
  async getUser(blockId: string): Promise<UserEntity> {
    return this.#destinationUser.load(blockId);
  }
}
