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
import { BusinessChatCommonModule } from '@app/b-chat/modules/b-chat-common.module';
import { BusinessChatReportEntity } from '@app/b-chat/report/b-chat-report.entity';

describe('Business-Chat-Common-Integration-Test', () => {
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
                BusinessChatCommonModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined module', () => {
        expect(module.get<BusinessChatCommonModule>(BusinessChatCommonModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
