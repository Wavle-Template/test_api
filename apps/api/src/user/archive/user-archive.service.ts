import { UserArchiveEntity } from "@app/entity/user/archive/user-archive.entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { EntityManager, LessThan } from "typeorm";

@Injectable()
export class UserArchiveService extends CRUDService<UserArchiveEntity>{
    constructor(@InjectEntityManager() entityManager: EntityManager) {
        super(entityManager, UserArchiveEntity);
    }

    async deleteArchiveData(date: Date) {
        return await this.repository.delete({
            createdAt: LessThan(date)
        })
    }
}