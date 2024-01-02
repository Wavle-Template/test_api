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
import { BusinessChatWidthMatchModule } from '@app/b-chat/modules/b-chat-withd-match.module';
import { BusinessChatReportEntity } from '@app/b-chat/report/b-chat-report.entity';
import { MatchPostEntity } from '@app/match/post/match-post.entity';
import { MatchPostTypeEntity } from '@app/match/type/match-post-type.entity';
import { MatchPostCategoryEntity } from '@app/match/catrgory/match-post-category.entity';
import { MatchPostLogEntity } from '@app/match/log/match-post-log.entity';

describe('Business-Chat-Withd-Match-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity,
            BusinessChatReportEntity,
            MatchPostEntity, MatchPostLogEntity,
            MatchPostCategoryEntity, MatchPostTypeEntity,
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
                BusinessChatWidthMatchModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined module', () => {
        expect(module.get<BusinessChatWidthMatchModule>(BusinessChatWidthMatchModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
