import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserArchiveEntity } from "./archive/user-archive.entity";
import { UserBlockEntity } from "./block/block.entity";
import { UserFCMTokenEntity } from "./fcm-token/fcm-token.entity";
import { UserFollowEntity } from "./follow/follow.entity";
import { UserSuspenedLogEntity } from "./log/suspended.entity";
import { SleeperEntity } from "./sleeper/sleeper.entity";
import { UserSocialEntity } from "./social/social.entity";
import { UserEntity } from "./user.entity";

@Module({
    imports: [TypeOrmModule.forFeature(
        [
            UserEntity, UserBlockEntity, UserFCMTokenEntity,
            UserFollowEntity,
            UserSocialEntity,
            UserSuspenedLogEntity,
            SleeperEntity,
            UserArchiveEntity
        ]
    )],
    exports: [TypeOrmModule]
})
export class UserEntityModule { }