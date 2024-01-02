import { forwardRef, Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { COMMUNITY_POST_PUB_SUB_TOKEN } from "../community.const";

import {
  CommunityPostBasicLoader,
  CommunityPostByAuthorForCountLoader,
  CommunityPostByAuthorForHideCountLoader,
  CommunityPostByAuthorForLikeCountLoader,
  CommunityPostByAuthorLoader,
  CommunityPostForHideLoader,
  CommunityPostForLikeLoader
} from "./community-post.loader";
import { CommunityPostEntity } from "./community-post.entity";
import {
  CommunityPostResolver,
  NotificationcommunityPostFieldResolver,
  UserCommunityPostCountFieldResolver
} from "./community-post.resolver";
import { CommunityPostService } from "./community-post.service";
import { AuthModule } from "@app/auth";
// import { CommunityCategoryModule } from "../category/community-category.module";
import { BaseUserModule } from "@app/user";
import { BaseNotificationModule } from "@app/notification";
import { ConfigModule, ConfigService } from "@nestjs/config";
import Redis from "ioredis";
import { CommunityPostFavoriteEntity } from "./favorite/community-post-favorite.entity";
import { CommunityPostFavoriteBasicLoader, CommunityPostByAuthorForFavoriteCountLoader } from "./favorite/community-post-favorite.loader";
import { CommunityPostFavoriteService } from "./favorite/community-post-favorite.service";
import { CommunityPostFavoriteResolver, CommunityPostResolveFieldResolver, UserCommunityPostFavoriteCountFieldResolver } from "./favorite/community-post-favorite.resolver";
import { CommunityCategoryBasicLoader } from "../category/community-category.loader";
import { CommunityCategoryEntity } from "../category/community-category.entity";
import { FileModule } from "@app/file";

@Module({
  imports: [
    TypeOrmModule.forFeature([CommunityPostEntity, CommunityPostFavoriteEntity, CommunityCategoryEntity]),
    ConfigModule,
    AuthModule,
    // CommunityCategoryModule,
    BaseUserModule,
    BaseNotificationModule,
    // UserFollowModule,
    // UserModule,
    // NotificationKeywordsModule,
    FileModule,
    // forwardRef(() => BookmarkModule)
  ],
  providers: [
    CommunityPostService,
    CommunityPostResolver,
    CommunityPostBasicLoader,
    CommunityPostForLikeLoader,
    CommunityPostForHideLoader,
    NotificationcommunityPostFieldResolver,
    CommunityPostByAuthorLoader,
    UserCommunityPostCountFieldResolver,
    CommunityPostByAuthorForCountLoader,
    CommunityPostByAuthorForLikeCountLoader,
    CommunityPostByAuthorForHideCountLoader,
    {
      provide: COMMUNITY_POST_PUB_SUB_TOKEN,
      inject: [ConfigService],
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
    },
    CommunityCategoryBasicLoader,
    CommunityPostFavoriteBasicLoader,
    CommunityPostFavoriteService,
    CommunityPostFavoriteResolver,
    CommunityPostResolveFieldResolver,
    CommunityPostByAuthorForFavoriteCountLoader,
    UserCommunityPostFavoriteCountFieldResolver
  ],
  exports: [CommunityPostService, CommunityPostBasicLoader, CommunityPostForLikeLoader]
})
export class CommunityPostModule { }
