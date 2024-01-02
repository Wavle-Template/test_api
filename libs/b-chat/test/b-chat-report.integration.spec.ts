import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity } from '@app/common-chat-res';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { BusinessChatReportModule } from '@app/b-chat/report/b-chat-report.module';
import { BusinessChatReportLoader } from '@app/b-chat/report/b-chat-report.loader';
import { BusinessChatReportResolver } from '@app/b-chat/report/b-chat-report.resolver';
import { BusinessChatReportService } from '@app/b-chat/report/b-chat-report.service';
import { BusinessChatReportEntity } from '@app/b-chat/report/b-chat-report.entity';

describe('Business-Chat-Report-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity,
            BusinessChatReportEntity,
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
                BusinessChatReportModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined BusinessChatReportService', () => {
        expect(module.get<BusinessChatReportService>(BusinessChatReportService)).toBeDefined();
    });

    it('should be defined BusinessChatReportLoader', () => {
        expect(module.get<BusinessChatReportLoader>(BusinessChatReportLoader)).toBeDefined();
    });

    it('should be defined BusinessChatReportResolver', () => {
        expect(module.get<BusinessChatReportResolver>(BusinessChatReportResolver)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<BusinessChatReportModule>(BusinessChatReportModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
