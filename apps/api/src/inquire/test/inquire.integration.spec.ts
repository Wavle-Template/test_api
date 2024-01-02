import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { InquireModule } from '../inquire.module';
import { InquireService } from '../inquire.service';
import { InquireResolver } from '../inquire.resolver';
import { InquireLoader } from '../inquire.loader';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { NotificationStorageEntity } from '../../notification/storage/storage.entity';
import { InquireEntity } from '../inquire.entity';

describe('Inquire-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            InquireEntity,
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
                InquireModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined InquireService', () => {
        expect(module.get<InquireService>(InquireService)).toBeDefined();
    });

    it('should be defined InquireResolver', () => {
        expect(module.get<InquireResolver>(InquireResolver)).toBeDefined();
    });

    it('should be defined InquireLoader', () => {
        expect(module.get<InquireLoader>(InquireLoader)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<InquireModule>(InquireModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
