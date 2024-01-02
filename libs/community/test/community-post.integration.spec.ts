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
import { CommunityPostEntity } from '@app/community/post/community-post.entity';
import { CommunityCategoryEntity } from '@app/community/category/community-category.entity';
import { CommunityCategoryBasicLoader } from '@app/community/category/community-category.loader';
import { COMMUNITY_POST_PUB_SUB_TOKEN } from '@app/community/community.const';
import { CommunityPostFavoriteEntity } from '@app/community/post/favorite/community-post-favorite.entity';
import { CommunityCategoryFavoriteEntity } from '@app/community/category/favorite/community-category-favorite.entity';
import { CommunityPostModule } from '@app/community/post/community-post.module';
import { CommunityPostBasicLoader, CommunityPostForLikeLoader, CommunityPostForHideLoader, CommunityPostByAuthorLoader, CommunityPostByAuthorForCountLoader, CommunityPostByAuthorForLikeCountLoader, CommunityPostByAuthorForHideCountLoader } from '@app/community/post/community-post.loader';
import { CommunityPostResolver, NotificationcommunityPostFieldResolver, UserCommunityPostCountFieldResolver } from '@app/community/post/community-post.resolver';
import { CommunityPostService } from '@app/community/post/community-post.service';
import { CommunityPostFavoriteBasicLoader, CommunityPostByAuthorForFavoriteCountLoader } from '@app/community/post/favorite/community-post-favorite.loader';
import { CommunityPostFavoriteResolver, CommunityPostResolveFieldResolver, UserCommunityPostFavoriteCountFieldResolver } from '@app/community/post/favorite/community-post-favorite.resolver';
import { CommunityPostFavoriteService } from '@app/community/post/favorite/community-post-favorite.service';

describe('Community-Post-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            CommunityPostEntity,
            CommunityPostFavoriteEntity, CommunityCategoryEntity,
            CommunityCategoryFavoriteEntity,
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
                CommunityPostModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined CommunityPostService', () => {
        expect(module.get<CommunityPostService>(CommunityPostService)).toBeDefined();
    });
    it('should be defined CommunityPostResolver', () => {
        expect(module.get<CommunityPostResolver>(CommunityPostResolver)).toBeDefined();
    });
    it('should be defined CommunityPostBasicLoader', () => {
        expect(module.get<CommunityPostBasicLoader>(CommunityPostBasicLoader)).toBeDefined();
    });

    it('should be defined CommunityPostForLikeLoader', () => {
        expect(module.get<CommunityPostForLikeLoader>(CommunityPostForLikeLoader)).toBeDefined();
    });
    it('should be defined CommunityPostForHideLoader', () => {
        expect(module.get<CommunityPostForHideLoader>(CommunityPostForHideLoader)).toBeDefined();
    });
    it('should be defined NotificationcommunityPostFieldResolver', () => {
        expect(module.get<NotificationcommunityPostFieldResolver>(NotificationcommunityPostFieldResolver)).toBeDefined();
    });
    it('should be defined CommunityPostByAuthorLoader', () => {
        expect(module.get<CommunityPostByAuthorLoader>(CommunityPostByAuthorLoader)).toBeDefined();
    });
    it('should be defined UserCommunityPostCountFieldResolver', () => {
        expect(module.get<UserCommunityPostCountFieldResolver>(UserCommunityPostCountFieldResolver)).toBeDefined();
    });
    it('should be defined CommunityPostByAuthorForCountLoader', () => {
        expect(module.get<CommunityPostByAuthorForCountLoader>(CommunityPostByAuthorForCountLoader)).toBeDefined();
    });
    it('should be defined CommunityPostByAuthorForLikeCountLoader', () => {
        expect(module.get<CommunityPostByAuthorForLikeCountLoader>(CommunityPostByAuthorForLikeCountLoader)).toBeDefined();
    });
    it('should be defined CommunityPostByAuthorForHideCountLoader', () => {
        expect(module.get<CommunityPostByAuthorForHideCountLoader>(CommunityPostByAuthorForHideCountLoader)).toBeDefined();
    });
    it('should be defined COMMUNITY_POST_PUB_SUB_TOKEN', () => {
        expect(module.get<RedisPubSub>(COMMUNITY_POST_PUB_SUB_TOKEN)).toBeDefined();
    });
    it('should be defined CommunityCategoryBasicLoader', () => {
        expect(module.get<CommunityCategoryBasicLoader>(CommunityCategoryBasicLoader)).toBeDefined();
    });
    it('should be defined CommunityPostFavoriteBasicLoader', () => {
        expect(module.get<CommunityPostFavoriteBasicLoader>(CommunityPostFavoriteBasicLoader)).toBeDefined();
    });

    it('should be defined CommunityPostFavoriteService', () => {
        expect(module.get<CommunityPostFavoriteService>(CommunityPostFavoriteService)).toBeDefined();
    });

    it('should be defined CommunityPostFavoriteResolver', () => {
        expect(module.get<CommunityPostFavoriteResolver>(CommunityPostFavoriteResolver)).toBeDefined();
    });

    it('should be defined CommunityPostResolveFieldResolver', () => {
        expect(module.get<CommunityPostResolveFieldResolver>(CommunityPostResolveFieldResolver)).toBeDefined();
    });
    it('should be defined CommunityPostByAuthorForFavoriteCountLoader', () => {
        expect(module.get<CommunityPostByAuthorForFavoriteCountLoader>(CommunityPostByAuthorForFavoriteCountLoader)).toBeDefined();
    });
    it('should be defined UserCommunityPostFavoriteCountFieldResolver', () => {
        expect(module.get<UserCommunityPostFavoriteCountFieldResolver>(UserCommunityPostFavoriteCountFieldResolver)).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<CommunityPostModule>(CommunityPostModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
