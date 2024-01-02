import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { DeepPartial, EntityManager, Repository } from "typeorm";
import { MatchPostLogEntity } from "./match-post-log.entity";
import { MatchPostLogStateEnum } from "./match-post-log.enum";

@Injectable()
export class MatchPostLogService extends CRUDService<MatchPostLogEntity>{

    constructor(@InjectRepository(MatchPostLogEntity) repository: Repository<MatchPostLogEntity>) {
        super(repository);
    }

    async updateByMatchId(matchId: string, data: DeepPartial<MatchPostLogEntity>, transactionManager?: EntityManager): Promise<MatchPostLogEntity> {
        return this.useTransaction(async (manager: EntityManager) => {
            let item: MatchPostLogEntity = await manager.findOneOrFail(MatchPostLogEntity, {
                where: {
                    matchPostId: matchId,
                    state: MatchPostLogStateEnum.MATCHED
                }
            });
            item = manager.merge(MatchPostLogEntity, item, data);
            item = await manager.save(item);

            return item;
        }, transactionManager);
    }

    async updateByMatchIdAndTraderId(matchId: string, traderId: string, data: DeepPartial<MatchPostLogEntity>, transactionManager?: EntityManager): Promise<MatchPostLogEntity> {
        return this.useTransaction(async (manager: EntityManager) => {
            let item: MatchPostLogEntity = await manager.findOneOrFail(MatchPostLogEntity, {
                where: {
                    matchPostId: matchId,
                    traderId: traderId,
                    state: MatchPostLogStateEnum.MATCHED
                }
            });
            item = manager.merge(MatchPostLogEntity, item, data);
            item = await manager.save(item);

            return item;
        }, transactionManager);
    }

    async matchEnd(matchId: string, traderId: string, data: DeepPartial<MatchPostLogEntity>, transactionManager?: EntityManager): Promise<MatchPostLogEntity> {
        return this.useTransaction(async (manager: EntityManager) => {
            let item: MatchPostLogEntity = await manager.findOneOrFail(MatchPostLogEntity, {
                where: {
                    matchPostId: matchId,
                    traderId: traderId,
                    state: MatchPostLogStateEnum.MATCHED
                }
            });
            item = manager.merge(MatchPostLogEntity, item, data);
            item = await manager.save(item);

            return item;
        }, transactionManager);
    }
}