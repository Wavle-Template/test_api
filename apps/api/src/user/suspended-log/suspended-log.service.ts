import { UserSuspenedLogEntity } from "@app/entity/user/log/suspended.entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { EntityManager } from "typeorm";

@Injectable()
export class UserSuspendedLogService extends CRUDService<UserSuspenedLogEntity>{
    constructor(
        @InjectEntityManager() entityManager: EntityManager,
    ) {
        super(entityManager, UserSuspenedLogEntity);
    }
}