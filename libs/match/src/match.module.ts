import { AuthModule } from '@app/auth';
import { UserEntityModule } from '@app/entity';
import { FileModule } from '@app/file';
import { BaseNotificationModule } from '@app/notification';
import { BaseUserModule } from '@app/user';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MatchPostCategoryEntity } from './catrgory/match-post-category.entity';
import { MatchPostCategoryBasicLoader } from './catrgory/match-post-category.loader';
import { MatchPostCategoryResolver } from './catrgory/match-post-category.resolver';
import { MatchPostCategoryService } from './catrgory/match-post-category.service';
import { MatchPostLogEntity } from './log/match-post-log.entity';
import { MatchPostLogService } from './log/match-post-log.service';
import { MatchPostEntity } from './post/match-post.entity';
import { MatchPostBasicLoader } from './post/match-post.loader';
import { MatchPostResolver, UserMatchPostCountFieldResolver } from './post/match-post.resolver';
import { MatchPostService } from './post/match-post.service';
import { MatchPostTypeEntity } from './type/match-post-type.entity';
import { MatchPostTypeBasicLoader } from './type/match-post-type.loader';
import { MatchPostTypeResolver } from './type/match-post-type.resolver';
import { MatchPostTypeService } from './type/match-post-type.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([MatchPostEntity, MatchPostCategoryEntity, MatchPostTypeEntity, MatchPostLogEntity]),
    UserEntityModule,
    BaseNotificationModule,
    BaseUserModule,
    AuthModule,
    FileModule
  ],
  providers: [
    MatchPostService, MatchPostResolver, UserMatchPostCountFieldResolver, MatchPostBasicLoader,
    MatchPostCategoryService, MatchPostCategoryResolver, MatchPostCategoryBasicLoader,
    MatchPostTypeService, MatchPostTypeResolver, MatchPostTypeBasicLoader,
    MatchPostLogService
  ],
  exports: [MatchPostService, MatchPostBasicLoader, MatchPostCategoryService, MatchPostCategoryBasicLoader, MatchPostTypeService, MatchPostTypeBasicLoader, MatchPostLogService],
})
export class MatchPostModule { }
