import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { ChatReportModule } from '@app/chat/report/chat-report.module';
import { ChatReportEntity } from '@app/chat/report/chat-report.entity';
import { ChatReportLoader } from '@app/chat/report/chat-report.loader';
import { ChatReportResolver } from '@app/chat/report/chat-report.resolver';
import { ChatReportService } from '@app/chat/report/chat-report.service';
import { ChatChannelEntity, ChatChannelParticipantEntity, ChatMessageEntity } from '@app/common-chat-res';

describe('Chat-Report-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            ChatReportEntity, ChatChannelEntity, ChatChannelParticipantEntity, ChatMessageEntity,
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
                ChatReportModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined ChatReportService', () => {
        expect(module.get<ChatReportService>(ChatReportService)).toBeDefined();
    });

    it('should be defined ChatReportLoader', () => {
        expect(module.get<ChatReportLoader>(ChatReportLoader)).toBeDefined();
    });

    it('should be defined ChatReportResolver', () => {
        expect(module.get<ChatReportResolver>(ChatReportResolver)).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<ChatReportModule>(ChatReportModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
