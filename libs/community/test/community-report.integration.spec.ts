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
import { CommunityReportLoader } from '@app/community/report/community-report.loader';
import { CommunityReportResolver } from '@app/community/report/community-report.resolver';
import { CommunityReportService } from '@app/community/report/community-report.service';
import { CommunityReportEntity } from '@app/community/report/community-report.entity';
import { CommunityReportModule } from '@app/community/report/community-report.module';
import { CommunityPostEntity } from '@app/community/post/community-post.entity';
import { CommunityPostReplyEntity } from '@app/community/reply/community-post-reply.entity';
import { CommunityCategoryEntity } from '@app/community/category/community-category.entity';

describe('Community-Report-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            CommunityReportEntity, CommunityPostEntity, CommunityCategoryEntity, CommunityPostReplyEntity,
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
                CommunityReportModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined CommunityReportService', () => {
        expect(module.get<CommunityReportService>(CommunityReportService)).toBeDefined();
    });

    it('should be defined CommunityReportLoader', () => {
        expect(module.get<CommunityReportLoader>(CommunityReportLoader)).toBeDefined();
    });

    it('should be defined CommunityReportResolver', () => {
        expect(module.get<CommunityReportResolver>(CommunityReportResolver)).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<CommunityReportModule>(CommunityReportModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
