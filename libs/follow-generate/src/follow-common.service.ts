import { UserEntity, UserFollowEntity } from '@app/entity';
import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectEntityManager } from '@nestjs/typeorm';
import { CRUDService, getEdges, getPageInfo } from '@yumis-coconudge/common-module';
import { Edge, PageInfo, PaginationArgs } from "@yumis-coconudge/typeorm-helper";
import { EntityManager } from 'typeorm';

@Injectable()
export class FollowCommonService extends CRUDService<UserFollowEntity> {
    /**
     * @param entityManager TypeORM 엔티티 매니저
     */
    constructor(@InjectEntityManager() entityManager: EntityManager) {
        super(entityManager, UserFollowEntity);
    }

    /**
     * 이미 팔로우 중인지 확인합니다.
     * @param userId 팔로우하는 사용자 ID
     * @param targetId 팔로우 당하는 사용자 ID
     * @param transactionManager 트랜잭션 매니저
     * @returns 팔로우 여부
     */
    async isExistsFollow(userId: string, targetId: string, transactionManager?: EntityManager): Promise<boolean> {
        return await this.useTransaction(async (manager: EntityManager) => {
            return (
                (await manager.count(UserFollowEntity, { where: { source: { id: userId }, destination: { id: targetId } } })) >
                0
            );
        }, transactionManager);
    }

    /**
     * 특정 사용자를 팔로우합니다.
     * @param userId 팔로우하는 사용자 ID
     * @param targetId 팔로우 당하는 사용자 ID
     * @returns 팔로우하는 사용자 엔티티
     */
    async follow(userId: string, targetId: string): Promise<UserEntity> {
        return this.entityManager.transaction(async manager => {
            const user = await manager.findOneOrFail(UserEntity, userId);
            const target = await manager.findOneOrFail(UserEntity, targetId);

            if ((await this.isExistsFollow(userId, targetId, manager)) === true)
                throw new BadRequestException("이미 팔로잉한 사용자입니다.");

            const follow = manager.create(UserFollowEntity, {
                source: user,
                destination: target,
            });

            await manager.save(follow);
            return await manager.findOne(UserEntity, user.id);
        });
    }

    /**
     * 특정 사용자를 팔로우 해제합니다.
     * @param userId 팔로우 해제하는 사용자 ID
     * @param targetId 팔로우 해제당하는 사용자 ID
     * @returns 팔로우 해제하는 사용자 엔티티
     */
    async unfollow(userId: string, targetId: string): Promise<UserEntity> {
        return this.entityManager.transaction(async manager => {
            const user = await manager.findOneOrFail(UserEntity, userId, { relations: ["followees"] });
            const target = await manager.findOneOrFail(UserEntity, targetId);

            if ((await this.isExistsFollow(userId, targetId, manager)) === false)
                throw new BadRequestException("팔로잉한 사용자가 아닙니다.");

            const follow = await manager.findOne(UserFollowEntity, {
                source: user,
                destination: target,
            });

            await manager.softRemove(follow);
            return await manager.findOne(UserEntity, user.id);
        });
    }

    async countByUserId(userId: string): Promise<number> {
        return await this.entityManager.count(UserFollowEntity, { where: { source: { id: userId } } });
    }

    async getEdgesByUserId(userId: string, args: PaginationArgs): Promise<Edge<UserFollowEntity>[]> {
        const builder = this.getQueryBuilder("follows").where("follows.sourceId = :sourceId", { sourceId: userId });

        return await getEdges(builder, args);
    }

    async getPageInfoByUserId(userId: string, edges: Edge<UserFollowEntity>[], args: PaginationArgs): Promise<PageInfo> {
        const builder = this.getQueryBuilder("follows").where("follows.sourceId = :sourceId", { sourceId: userId });
        return await getPageInfo(builder, edges, args);
    }

    /**
     * 내가 팔로우한 유저들의 IDS
     * @param myUserId 내 User ID
     * @returns string[]
     */
    async myFollowUserIds(myUserId: string): Promise<string[]> {
        const ids = await this.repository.find({
            where: {
                sourceId: myUserId
            }
        })
        return ids.map(item => item.destinationId);
    }

    /**
     * 나를 팔로우한 유저들의 Ids
     * @param myUserId 나의 User Id
     * @returns string[]
     */
    async myFollowerUserIds(myUserId: string): Promise<string[]> {
        const ids = await this.repository.find({
            where: {
                destinationId: myUserId
            }
        })
        return ids.map(item => item.sourceId)
    }
}
