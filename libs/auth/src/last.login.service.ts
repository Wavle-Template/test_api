import { UserEntity } from "@app/entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { EntityManager } from "typeorm";

@Injectable()
export class LastLoginService {
    /** TypeORM 엔티티 매니저 */
    #entityManager: EntityManager;
    constructor(
        @InjectEntityManager() entityManager: EntityManager,
    ) {
        this.#entityManager = entityManager;
    }

    /** 
   * 마지막 로그인 날짜갱신
   */
    async updateLastLoginAt(userId: string) {
        return await this.#entityManager.update(UserEntity, userId, {
            lastLoginAt: new Date()
        })
    }
}