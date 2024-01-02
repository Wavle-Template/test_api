/**
 * @module UserFollowModule
 */
import LRUCache from "lru-cache";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { AbstractTypeORMService } from "@yumis-coconudge/common-module";
import DataLoader from "dataloader";
import { EntityManager, In } from "typeorm";
import { UserEntity, UserFollowEntity } from "@app/entity";

/**
 * 사용자 팔로우의 ResolveField를 처리하기 위한 데이터 로더
 * @category Provider
 */
@Injectable()
export class UserFollowLoader extends AbstractTypeORMService<UserFollowEntity> {
  /** 팔로우 당한 사용자 데이터 로더 */
  #destinationUser: DataLoader<string, UserEntity>;

  /** 팔로워 개수 데이터 로더 */
  #followerCnt: DataLoader<string, number>;

  /** 팔로잉 개수 데이터 로더 */
  #followintCnt: DataLoader<string, number>;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   */
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, UserFollowEntity);

    this.#destinationUser = new DataLoader(
      async (followIds: string[]) => {
        const follows = await this.entityManager.find(UserFollowEntity, {
          where: { id: In(followIds) },
          relations: ["destination"],
        });

        return followIds.map(id => follows.find(block => block.id === id).destination);
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );

    this.#followerCnt = new DataLoader(
      async (userIds: string[]) => {
        const list: { followerId: string, cnt: number }[] = await this.entityManager.createQueryBuilder(UserFollowEntity, "follow")
          .select("follow.destinationId", "followerId")
          .addSelect("count(follow.id)", "cnt")
          .where(`follow.destinationId in (:...ids)`, { ids: userIds })
          .groupBy("follow.destinationId")
          .orderBy("follow.destinationId", "ASC")
          .getRawMany();
        
        return userIds.map(userId => list.find(item => item.followerId === userId)?.cnt ?? 0)
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );

    this.#followintCnt = new DataLoader(
      async (userIds: string[]) => {
        const list: { followingId: string, cnt: number }[] = await this.entityManager.createQueryBuilder(UserFollowEntity, "follow")
          .select("follow.sourceId", "followingId")
          .addSelect("count(follow.id)", "cnt")
          .where(`follow.sourceId in (:...ids)`, { ids: userIds })
          .groupBy("follow.sourceId")
          .orderBy("follow.sourceId", "ASC")
          .getRawMany();
        return userIds.map(userId => list.find(item => item.followingId === userId)?.cnt ?? 0)
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );

  }

  /**
   * 특정 팔로우의 팔로우 당한 사용자를 가져옵니다.
   * @param followId 팔로우 ID
   * @returns 사용자 엔티티
   */
  async getDestinationUser(followId: string): Promise<UserEntity> {
    return this.#destinationUser.load(followId);
  }

  /**
   * 특정 유저의 팔로워 개수.
   * @param followId 사용자 ID
   * @returns 팔로워 개수
   */
  async getFollowerCnt(followId: string): Promise<Number> {
    return this.#followerCnt.load(followId);
  }

  /**
   * 특정 유저의 팔로잉 개수.
   * @param followId 사용자 ID
   * @returns 팔로잉 개수
   */
  async getFollowingCnt(followId: string): Promise<Number> {
    return this.#followintCnt.load(followId);
  }

}
