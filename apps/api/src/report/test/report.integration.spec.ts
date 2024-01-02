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
import { ReportEntity } from '../report.entity';
import { ReportModule } from '../report.module';
import { ReportService } from '../report.service';
import { ReportResolver } from '../report.resolver'
import { ReportLoader } from '../report.loader'

describe('Report-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            ReportEntity,
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
                ReportModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined ReportService', () => {
        expect(module.get<ReportService>(ReportService)).toBeDefined();
    });

    it('should be defined ReportResolver', () => {
        expect(module.get<ReportResolver>(ReportResolver)).toBeDefined();
    });

    it('should be defined ReportLoader', () => {
        expect(module.get<ReportLoader>(ReportLoader)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<ReportModule>(ReportModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
