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
import { NotificationModule } from '../notification.module';
import Redis from 'ioredis';
import { NOTIFICATION_UN_READ_REDIS } from '../notification.const';
import { NotificationService } from '../notification.service';

describe('Notification-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            NotificationEntity, NotificationReadEntity,
            UserSuspenedLogEntity, SleeperEntity,
            UserArchiveEntity,
            NotificationStorageEntity
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                NotificationModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined NotificationService', () => {
        expect(module.get<NotificationService>(NotificationService)).toBeDefined();
    });

    it('should be defined Redis', () => {
        expect(module.get<Redis>(NOTIFICATION_UN_READ_REDIS)).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<NotificationModule>(NotificationModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
