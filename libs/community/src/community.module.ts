import { AuthModule } from '@app/auth';
import { FileEntityModule } from '@app/entity';
import { BaseNotificationModule } from '@app/notification';
import { BaseUserModule } from '@app/user';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { CommunityCategoryEntity } from './category/community-category.entity';
import { CommunityCategoryBasicLoader } from './category/community-category.loader';
import { CommunityCategoryResolver } from './category/community-category.resolver';
import { CommunityCategoryService } from './category/community-category.service';
import { CommunityCategoryFavoriteEntity } from './category/favorite/community-category-favorite.entity';
import { CommunityCategoryFavoriteByUserIdLoader } from './category/favorite/community-category-favorite.loader';
import { CommunityCategoryFavoriteResolver, CommunityCategoryResolveFieldResolver } from './category/favorite/community-category-favorite.resolver';
import { CommunityCategoryFavoriteService } from './category/favorite/community-category-favorite.service';
import { COMMUNITY_POST_REPLY_PUB_SUB_TOKEN } from './community.const';
import { CommunityPostEntity } from './post/community-post.entity';
import { CommunityPostModule } from './post/community-post.module';
import { CommunityPostReplyEntity } from './reply/community-post-reply.entity';
import { CommunityPostReplyBasicLoader, CommunityPostReplyByParentReplyLoader, CommunityPostReplyByPostLoader, CommunityPostReplyForLikeLoader } from './reply/community-post-reply.loader';
import { CommunityPostReplyResolver } from './reply/community-post-reply.resolver';
import { CommunityPostReplyService } from './reply/community-post-reply.service';
import { CommunityReportModule } from './report/community-report.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityPostEntity, CommunityPostReplyEntity, CommunityCategoryEntity, CommunityCategoryFavoriteEntity]),
    ConfigModule,
    AuthModule,
    // CommunityCategoryModule,
    BaseUserModule,
    BaseNotificationModule,
    // UserFollowModule,
    // UserModule,
    // NotificationKeywordsModule,
    FileEntityModule,
    // forwardRef(() => BookmarkModule)
    CommunityPostModule,
    CommunityReportModule
  ],
  providers: [
    CommunityPostReplyForLikeLoader,
    CommunityPostReplyByPostLoader,
    CommunityPostReplyByParentReplyLoader,
    CommunityPostReplyService,
    CommunityPostReplyResolver,
    CommunityPostReplyBasicLoader,
    {
      provide: COMMUNITY_POST_REPLY_PUB_SUB_TOKEN,
      useFactory: (configService: ConfigService) => {
        const redisURL = configService.get("REDIS_URL");
        return new RedisPubSub({
          publisher: new Redis(redisURL),
          subscriber: new Redis(redisURL),
          reviver: (_, value) => {
            if (
              typeof value === "string" &&
              value.search(/(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])/g) === 0 &&
              isNaN(Date.parse(value)) === false
            ) {
              return new Date(value);
            }
            return value;
          },
        });
      },
      inject: [ConfigService]
    },
    CommunityCategoryResolver, CommunityCategoryService, CommunityCategoryBasicLoader,
    CommunityCategoryFavoriteByUserIdLoader,
    CommunityCategoryFavoriteService,
    CommunityCategoryFavoriteResolver,
    CommunityCategoryResolveFieldResolver
  ],
  exports: [CommunityPostReplyService, CommunityPostReplyService, CommunityCategoryService, CommunityCategoryFavoriteService],
})
export class CommunityModule { }
