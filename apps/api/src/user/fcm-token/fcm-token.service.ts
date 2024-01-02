/**
 * @module UserFCMTokenModule
 */
import { UserEntity, UserFCMTokenEntity } from "@app/entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { AbstractTypeORMService, DefaultEntity } from "@yumis-coconudge/common-module";
import { DeepPartial } from "ts-essentials";
import { EntityManager } from "typeorm";

/**
 * 사용자 FCM 토큰을 관리하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class UserFCMTokenService extends AbstractTypeORMService<UserFCMTokenEntity> {
  /**
   * @param entityManager TypeORM 엔티티 매니저
   */
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, UserFCMTokenEntity);
  }

  /**
   * FCM 등록 토큰이 이미 존재하는지 확인합니다.
   * @param fcmRegistrationToken FCM 등록 토큰
   * @param transactionManager 트랜잭션 매니저
   * @returns 등록 여부
   */
  async isExistsFCMRegistrationToken(
    fcmRegistrationToken: string,
    transactionManager?: EntityManager,
  ): Promise<boolean> {
    return this.useTransaction(async manager => {
      return (await manager.count(UserFCMTokenEntity, { where: { fcmRegistrationToken: fcmRegistrationToken } })) > 0;
    }, transactionManager);
  }

  /**
   * 특정 사용자 FCM 토큰을 조회합니다.
   * @param id 토큰 ID
   * @returns 사용자 FCM 토큰 엔티티
   */
  async findOne(id: string): Promise<UserFCMTokenEntity> {
    return this.repository.findOne(id);
  }

  /**
   * FCM 등록 토큰을 이용하여 토큰을 조회합니다.
   * @param fcmRegistrationToken FCM 등록 토큰
   * @returns 사용자 FCM 토큰 엔티티
   */
  async findByFCMRegistrationToken(fcmRegistrationToken: string): Promise<UserFCMTokenEntity> {
    return this.repository.findOne({ where: { fcmRegistrationToken: fcmRegistrationToken } });
  }

  /**
   * 사용자 FCM 토큰을 생성합니다. 이미 존재하는 경우에는 갱신을 수행합니다.
   * @param data FCM 토큰 생성 데이터
   * @returns 생성된 사용자 FCM 토큰 엔티티
   */
  async set(data: DeepPartial<Omit<UserFCMTokenEntity, keyof DefaultEntity>>): Promise<UserFCMTokenEntity> {
    return this.entityManager.transaction(async manager => {
      let fcmToken: UserFCMTokenEntity;
      if (data.fcmRegistrationToken !== undefined) {
        fcmToken = await manager.findOne(UserFCMTokenEntity, {
          where: { fcmRegistrationToken: data.fcmRegistrationToken },
        });
      }

      if (fcmToken != null) {
        fcmToken.updatedAt = new Date();
        return await manager.save(fcmToken);
      }

      const user = await manager.findOneOrFail(UserEntity, data.user.id);
      fcmToken = manager.create<UserFCMTokenEntity>(UserFCMTokenEntity, {
        ...data,
        user: user,
      });
      return await manager.save(fcmToken);
    });
  }

  /**
   * 사용자 FCM 토큰을 삭제합니다.
   * @param fcmRegistrationToken FCM 등록 토큰
   * @returns 삭제된 사용자 FCM 토큰 엔티티
   */
  async remove(fcmRegistrationToken: string): Promise<UserFCMTokenEntity> {
    return this.entityManager.transaction(async manager => {
      const device = await manager.findOneOrFail(UserFCMTokenEntity, {
        where: { fcmRegistrationToken: fcmRegistrationToken },
      });
      return await manager.softRemove(device);
    });
  }
}
