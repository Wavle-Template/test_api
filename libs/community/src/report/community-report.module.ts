import { AuthModule } from "@app/auth";
import { FileEntityModule } from "@app/entity";
import { FileModule } from "@app/file";
import { BaseUserModule } from "@app/user";
import { forwardRef, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { CommunityPostEntity } from "../post/community-post.entity";
import { CommunityPostReplyEntity } from "../reply/community-post-reply.entity";
import { CommunityReportEntity } from "./community-report.entity";
import { CommunityReportLoader } from "./community-report.loader";
import { CommunityReportResolver } from "./community-report.resolver";
import { CommunityReportService } from "./community-report.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([CommunityPostEntity, CommunityReportEntity, CommunityPostReplyEntity]),
        ConfigModule,
        AuthModule,
        BaseUserModule,
        FileModule
    ],
    providers: [
        CommunityReportService,
        CommunityReportLoader,
        CommunityReportResolver,
    ],
    exports: [CommunityReportService, CommunityReportLoader]
})
export class CommunityReportModule { }
