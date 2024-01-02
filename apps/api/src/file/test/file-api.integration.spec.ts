import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { NotificationStorageEntity } from '../../notification/storage/storage.entity';
import { FileEntity } from '@app/entity';
import { FileApiModule } from '../file-api.module';
import { FileApiController } from '../file-api.controller';
import { FileApiResolver } from '../file-api.resolver';

describe('File-API-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            FileEntity,
            UserSuspenedLogEntity, SleeperEntity,
            UserArchiveEntity, NotificationEntity,
            NotificationReadEntity, NotificationStorageEntity
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                FileApiModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined FileApiResolver', () => {
        expect(module.get<FileApiResolver>(FileApiResolver)).toBeDefined();
    });

    it('should be defined FileApiController', () => {
        expect(module.get<FileApiController>(FileApiController)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<FileApiModule>(FileApiModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
