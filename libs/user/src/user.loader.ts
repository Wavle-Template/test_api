/**
 * @module UserModule
 */
import LRUCache from "lru-cache";
import DataLoader from "dataloader";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, In, Repository } from "typeorm";
import { UserEntity, UserFollowEntity, UserSocialEntity } from "@app/entity";

/**
 * 사용자의 ResolveField를 처리하기 위한 데이터 로더
 * @category Provider
 */
@Injectable()
export class BaseUserLoader {
    #entityManager: EntityManager;
    #repository: Repository<UserEntity>;
    #getInfo: DataLoader<string, UserEntity>;

    constructor(@InjectEntityManager() entityManager: EntityManager) {
        this.#entityManager = entityManager;

        this.#getInfo = new DataLoader(
            async (keys: string[]) => {
                const infos = await this.#entityManager.findByIds(UserEntity, keys);
                return keys.map(id => infos.find(item => item.id === id));
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );
    }

    async getInfo(id: string): Promise<UserEntity> {
        return this.#getInfo.load(id);
    }
}
