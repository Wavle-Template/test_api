import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { MatchPostModule } from '@app/match';
import { MatchPostCategoryEntity } from '@app/match/catrgory/match-post-category.entity';
import { MatchPostLogEntity } from '@app/match/log/match-post-log.entity';
import { MatchPostEntity } from '@app/match/post/match-post.entity';
import { MatchPostTypeEntity } from '@app/match/type/match-post-type.entity';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { OneSidedMatchModule } from '@app/match/business/one-sided/one-sided-match.module';
import { OneSidedMatchResolver } from '@app/match/business/one-sided/one-sided-match.resolver';

describe('Match-One-Sided-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            MatchPostEntity, MatchPostCategoryEntity, MatchPostTypeEntity, MatchPostLogEntity,
            UserSuspenedLogEntity, SleeperEntity,
            UserArchiveEntity, NotificationEntity,
            NotificationReadEntity
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                OneSidedMatchModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined MatchPostModule', () => {
        expect(module.get<MatchPostModule>(MatchPostModule)).toBeDefined();
    });

    it('should be defined OneSidedMatchResolver', () => {
        expect(module.get<OneSidedMatchResolver>(OneSidedMatchResolver)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<OneSidedMatchModule>(OneSidedMatchModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
