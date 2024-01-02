/**
 * @module UserBlockModule
 */
import { UserBlockEntity, UserEntity } from "@app/entity";
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService, getEdges, getPageInfo } from "@yumis-coconudge/common-module";
import { Edge, PageInfo, PaginationArgs } from "@yumis-coconudge/typeorm-helper";
import { EntityManager } from "typeorm";

/**
 * 사용자 차단을 관리하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class UserBlockService extends CRUDService<UserBlockEntity> {
  /**
   * @param entityManager TypeORM 엔티티 매니저
   */
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, UserBlockEntity);
  }

  /**
   * 이미 차단중인지 확인합니다.
   * @param userId 차단하는 사용자 ID
   * @param targetId 차단당할 사용자 ID
   * @param transactionManager 트랜잭션 매니저
   * @returns 차단 여부
   */
  async isExistsBlock(userId: string, targetId: string, transactionManager?: EntityManager): Promise<boolean> {
    return await this.useTransaction(async (manager: EntityManager) => {
      return (
        (await manager.count(UserBlockEntity, { where: { source: { id: userId }, destination: { id: targetId } } })) > 0
      );
    }, transactionManager);
  }

  /**
   * 특정 사용자를 차단합니다.
   * @param userId 차단하는 사용자 ID
   * @param targetId 차단당할 사용자 ID
   * @returns 차단하는 사용자 ID
   */
  async block(userId: string, targetId: string): Promise<UserEntity> {
    return this.entityManager.transaction(async manager => {
      const user = await manager.findOneOrFail(UserEntity, userId);
      const target = await manager.findOneOrFail(UserEntity, targetId);

      if ((await this.isExistsBlock(userId, targetId, manager)) === true)
        throw new BadRequestException("이미 차단한 사용자입니다.");

      const block = manager.create(UserBlockEntity, {
        source: user,
        destination: target,
      });

      await manager.save(block);
      return await manager.findOne(UserEntity, user.id);
    });
  }

  /**
   * 특정 사용자를 차단 해제합니다.
   * @param userId 차단하던 사용자 ID
   * @param targetId 차단 해제할 사용자 ID
   * @returns 차단하던 사용자 ID
   */
  async unblock(userId: string, targetId: string): Promise<UserEntity> {
    return this.entityManager.transaction(async manager => {
      const user = await manager.findOneOrFail(UserEntity, userId, { relations: ["followees"] });
      const target = await manager.findOneOrFail(UserEntity, targetId);

      if ((await this.isExistsBlock(userId, targetId, manager)) === false)
        throw new BadRequestException("차단한 사용자가 아닙니다.");

      const block = await manager.findOne(UserBlockEntity, {
        source: user,
        destination: target,
      });
      await manager.softRemove(block);
      return await manager.findOne(UserEntity, user.id);
    });
  }

  async countByUserId(userId: string): Promise<number> {
    return await this.entityManager.count(UserBlockEntity, { where: { source: { id: userId } } });
  }

  async getEdgesByUserId(userId: string, args: PaginationArgs): Promise<Edge<UserBlockEntity>[]> {
    const builder = this.getQueryBuilder("blocks").where("blocks.sourceId = :sourceId", { sourceId: userId });

    return await getEdges(builder, args);
  }

  async getPageInfoByUserId(userId: string, edges: Edge<UserBlockEntity>[], args: PaginationArgs): Promise<PageInfo> {
    const builder = this.getQueryBuilder("blocks").where("blocks.sourceId = :sourceId", { sourceId: userId });
    return await getPageInfo(builder, edges, args);
  }
}
