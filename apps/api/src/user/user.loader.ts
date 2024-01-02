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
export class UserLoader {
  #entityManager: EntityManager;
  #repository: Repository<UserEntity>;
  #socials: DataLoader<string, UserSocialEntity[]>;
  #followees: DataLoader<{ id: string; limit: number }, UserEntity[]>;
  #isFollowing: DataLoader<{ sourceId: string; destinationId: string }, boolean>;
  #getInfo: DataLoader<string, UserEntity>;

  constructor(@InjectEntityManager() entityManager: EntityManager) {
    this.#entityManager = entityManager;

    this.#socials = new DataLoader(
      async (ids: string[]) => {
        const users = await this.#repository.find({
          where: { id: In(ids) },
          relations: ["socials"],
          select: ["id", "socials"],
        });

        return ids.map(id => users.find(user => user.id === id).socials);
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );

    this.#followees = new DataLoader(
      async (keys: { id: string; limit: number }[]) => {
        let queries = [];
        let parameters = [];

        for (const { id, limit } of keys) {
          const hexId = id.replace(/[-]/g, "");

          const builder = this.#entityManager
            .createQueryBuilder(UserFollowEntity, "follows")
            .select("*")
            .where(`follows.sourceId = :${hexId}_id`, { [`${hexId}_id`]: id })
            .limit(limit);
          queries.push(`(${builder.getSql()})`);
          for (const parameter of Object.values(builder.getParameters())) {
            parameters.push(parameter);
          }
        }

        const rawQuery = queries.join(" UNION ALL ");
        const regex = /[$][0-9]+/g;
        let unionQuery = rawQuery;
        let result: RegExpExecArray;
        let i = 1;
        while ((result = regex.exec(unionQuery))) {
          unionQuery =
            unionQuery.substring(0, result.index) + `$${i}` + unionQuery.substring(result.index + result[0].length);
          i++;
        }
        const follows: UserFollowEntity[] = await this.#entityManager.query(unionQuery, parameters);
        const followees = keys.map(({ id }) =>
          follows.filter(follow => follow.sourceId === id).map(follow => follow.destinationId),
        );
        const users = await this.#repository.find({ where: { id: In(followees.flat()) } });

        return followees.map(followee => followee.map(id => users.find(user => user.id === id)));
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );

    this.#isFollowing = new DataLoader(
      async (keys: { sourceId: string; destinationId: string }[]) => {
        const sourceIds = keys.map(({ sourceId }) => sourceId);
        const destinationIds = keys.map(({ destinationId }) => destinationId);

        const follows = await this.#entityManager.find(UserFollowEntity, {
          where: {
            source: { id: In(sourceIds) },
            destination: { id: In(destinationIds) },
          },
          select: ["id", "source", "destination"],
        });

        return keys.map(
          ({ sourceId, destinationId }) =>
            follows.filter(follow => follow.sourceId === sourceId && follow.destinationId === destinationId).length > 0,
        );
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );
    this.#getInfo = new DataLoader(
      async (keys: string[]) => {
        const infos = await this.#entityManager.findByIds(UserEntity, keys);
        return keys.map(id => infos.find(item => item.id === id));
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );
  }

  async getSocials(id: string): Promise<UserSocialEntity[]> {
    return this.#socials.load(id);
  }

  async getFollowees(id: string, limit: number): Promise<UserEntity[]> {
    return this.#followees.load({ id, limit });
  }

  async isFollowing(sourceId: string, destinationId: string): Promise<boolean> {
    return this.#isFollowing.load({ sourceId, destinationId });
  }

  async getInfo(id: string): Promise<UserEntity> {
    return this.#getInfo.load(id);
  }
}
