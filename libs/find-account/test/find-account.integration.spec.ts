import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { FindAccountModule, FindAccountService } from '@app/find-account';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';

describe('Find-Account-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
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
                FindAccountModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined FindAccountService', () => {
        expect(module.get<FindAccountService>(FindAccountService)).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<FindAccountModule>(FindAccountModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
