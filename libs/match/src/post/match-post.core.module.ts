import { AuthModule } from "@app/auth";
import { FileModule } from "@app/file";
import { BaseNotificationModule } from "@app/notification";
import { BaseUserModule } from "@app/user";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MatchPostLogEntity } from "../log/match-post-log.entity";
import { MatchPostLogService } from "../log/match-post-log.service";
import { MatchPostTypeEntity } from "../type/match-post-type.entity";
import { MatchPostEntity } from "./match-post.entity";
import { MatchPostBasicLoader } from "./match-post.loader";
import { MatchPostService } from "./match-post.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([MatchPostEntity, MatchPostTypeEntity, MatchPostLogEntity]),
        AuthModule, BaseUserModule, BaseNotificationModule, FileModule
    ],
    providers: [MatchPostService, MatchPostBasicLoader, MatchPostLogService],
    exports: [MatchPostService, MatchPostBasicLoader, MatchPostLogService]
})
export class MatchPostCoreModule { }