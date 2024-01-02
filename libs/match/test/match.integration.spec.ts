import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { MatchPostModule, MatchPostService } from '@app/match';
import { MatchPostCategoryEntity } from '@app/match/catrgory/match-post-category.entity';
import { MatchPostLogEntity } from '@app/match/log/match-post-log.entity';
import { MatchPostEntity } from '@app/match/post/match-post.entity';
import { MatchPostTypeEntity } from '@app/match/type/match-post-type.entity';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { MatchPostCategoryBasicLoader } from '@app/match/catrgory/match-post-category.loader';
import { MatchPostCategoryService } from '@app/match/catrgory/match-post-category.service';
import { MatchPostLogService } from '@app/match/log/match-post-log.service';
import { MatchPostBasicLoader } from '@app/match/post/match-post.loader';
import { MatchPostResolver, UserMatchPostCountFieldResolver } from '@app/match/post/match-post.resolver';
import { MatchPostTypeBasicLoader } from '@app/match/type/match-post-type.loader';
import { MatchPostTypeResolver } from '@app/match/type/match-post-type.resolver';
import { MatchPostTypeService } from '@app/match/type/match-post-type.service';

describe('Match-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            MatchPostEntity, MatchPostCategoryEntity, MatchPostTypeEntity, MatchPostLogEntity,
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
                MatchPostModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined MatchPostService', () => {
        expect(module.get<MatchPostService>(MatchPostService)).toBeDefined();
    });

    it('should be defined MatchPostResolver', () => {
        expect(module.get<MatchPostResolver>(MatchPostResolver)).toBeDefined();
    });

    it('should be defined UserMatchPostCountFieldResolver', () => {
        expect(module.get<UserMatchPostCountFieldResolver>(UserMatchPostCountFieldResolver)).toBeDefined();
    });

    it('should be defined MatchPostBasicLoader', () => {
        expect(module.get<MatchPostBasicLoader>(MatchPostBasicLoader)).toBeDefined();
    });

    it('should be defined MatchPostCategoryService', () => {
        expect(module.get<MatchPostCategoryService>(MatchPostCategoryService)).toBeDefined();
    });

    it('should be defined MatchPostCategoryBasicLoader', () => {
        expect(module.get<MatchPostCategoryBasicLoader>(MatchPostCategoryBasicLoader)).toBeDefined();
    });

    it('should be defined MatchPostTypeService', () => {
        expect(module.get<MatchPostTypeService>(MatchPostTypeService)).toBeDefined();
    });

    it('should be defined MatchPostTypeResolver', () => {
        expect(module.get<MatchPostTypeResolver>(MatchPostTypeResolver)).toBeDefined();
    });
    it('should be defined MatchPostTypeBasicLoader', () => {
        expect(module.get<MatchPostTypeBasicLoader>(MatchPostTypeBasicLoader)).toBeDefined();
    });
    it('should be defined MatchPostLogService', () => {
        expect(module.get<MatchPostLogService>(MatchPostLogService)).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<MatchPostModule>(MatchPostModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
