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
import { HashtagModule } from '../hashtag.module';
import { HashtagEntity } from '../hashtag.entity';
import { HashtagResolver } from '../hashtag.resolver';
import { HashtagService } from '../hashtag.service';

describe('HashTag-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            HashtagEntity,
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
                HashtagModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined HashtagService', () => {
        expect(module.get<HashtagService>(HashtagService)).toBeDefined();
    });

    it('should be defined HashtagResolver', () => {
        expect(module.get<HashtagResolver>(HashtagResolver)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<HashtagModule>(HashtagModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
