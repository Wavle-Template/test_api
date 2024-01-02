import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { CommunityModule } from '@app/community';
import { CommunityPostEntity } from '@app/community/post/community-post.entity';
import { CommunityPostReplyEntity } from '@app/community/reply/community-post-reply.entity';
import { CommunityCategoryEntity } from '@app/community/category/community-category.entity';
import { CommunityReportEntity } from '@app/community/report/community-report.entity';
import { CommunityCategoryBasicLoader } from '@app/community/category/community-category.loader';
import { CommunityCategoryResolver } from '@app/community/category/community-category.resolver';
import { CommunityCategoryService } from '@app/community/category/community-category.service';
import { CommunityCategoryFavoriteByUserIdLoader } from '@app/community/category/favorite/community-category-favorite.loader';
import { CommunityCategoryFavoriteResolver, CommunityCategoryResolveFieldResolver } from '@app/community/category/favorite/community-category-favorite.resolver';
import { CommunityCategoryFavoriteService } from '@app/community/category/favorite/community-category-favorite.service';
import { COMMUNITY_POST_REPLY_PUB_SUB_TOKEN } from '@app/community/community.const';
import { CommunityPostFavoriteEntity } from '@app/community/post/favorite/community-post-favorite.entity';
import { CommunityPostReplyForLikeLoader, CommunityPostReplyByPostLoader, CommunityPostReplyByParentReplyLoader, CommunityPostReplyBasicLoader } from '@app/community/reply/community-post-reply.loader';
import { CommunityPostReplyResolver } from '@app/community/reply/community-post-reply.resolver';
import { CommunityPostReplyService } from '@app/community/reply/community-post-reply.service';
import { CommunityCategoryFavoriteEntity } from '@app/community/category/favorite/community-category-favorite.entity';

describe('Community-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            CommunityPostEntity, CommunityPostReplyEntity,
            CommunityPostFavoriteEntity, CommunityCategoryEntity,
            CommunityReportEntity, CommunityCategoryFavoriteEntity,
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
                CommunityModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined CommunityPostReplyForLikeLoader', () => {
        expect(module.get<CommunityPostReplyForLikeLoader>(CommunityPostReplyForLikeLoader)).toBeDefined();
    });
    it('should be defined CommunityPostReplyByPostLoader', () => {
        expect(module.get<CommunityPostReplyByPostLoader>(CommunityPostReplyByPostLoader)).toBeDefined();
    });
    it('should be defined CommunityPostReplyByParentReplyLoader', () => {
        expect(module.get<CommunityPostReplyByParentReplyLoader>(CommunityPostReplyByParentReplyLoader)).toBeDefined();
    });

    it('should be defined CommunityPostReplyService', () => {
        expect(module.get<CommunityPostReplyService>(CommunityPostReplyService)).toBeDefined();
    });
    it('should be defined CommunityPostReplyResolver', () => {
        expect(module.get<CommunityPostReplyResolver>(CommunityPostReplyResolver)).toBeDefined();
    });
    it('should be defined CommunityPostReplyBasicLoader', () => {
        expect(module.get<CommunityPostReplyBasicLoader>(CommunityPostReplyBasicLoader)).toBeDefined();
    });
    it('should be defined COMMUNITY_POST_REPLY_PUB_SUB_TOKEN', () => {
        expect(module.get<RedisPubSub>(COMMUNITY_POST_REPLY_PUB_SUB_TOKEN)).toBeDefined();
    });
    it('should be defined CommunityCategoryResolver', () => {
        expect(module.get<CommunityCategoryResolver>(CommunityCategoryResolver)).toBeDefined();
    });
    it('should be defined CommunityCategoryService', () => {
        expect(module.get<CommunityCategoryService>(CommunityCategoryService)).toBeDefined();
    });
    it('should be defined CommunityCategoryBasicLoader', () => {
        expect(module.get<CommunityCategoryBasicLoader>(CommunityCategoryBasicLoader)).toBeDefined();
    });
    it('should be defined CommunityCategoryFavoriteByUserIdLoader', () => {
        expect(module.get<CommunityCategoryFavoriteByUserIdLoader>(CommunityCategoryFavoriteByUserIdLoader)).toBeDefined();
    });
    it('should be defined CommunityCategoryFavoriteService', () => {
        expect(module.get<CommunityCategoryFavoriteService>(CommunityCategoryFavoriteService)).toBeDefined();
    });
    it('should be defined CommunityCategoryFavoriteResolver', () => {
        expect(module.get<CommunityCategoryFavoriteResolver>(CommunityCategoryFavoriteResolver)).toBeDefined();
    });
    it('should be defined CommunityCategoryResolveFieldResolver', () => {
        expect(module.get<CommunityCategoryResolveFieldResolver>(CommunityCategoryResolveFieldResolver)).toBeDefined();
    });
    

    it('should be defined module', () => {
        expect(module.get<CommunityModule>(CommunityModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
