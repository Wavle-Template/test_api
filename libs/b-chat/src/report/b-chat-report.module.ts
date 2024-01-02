import { AuthModule } from "@app/auth";
import { BusinessChatChannelEntity } from "@app/common-chat-res";
import { BusinessChatMessageEntity } from "@app/common-chat-res/entity/b-chat-message.entity";
import { FileModule } from "@app/file";
import { BaseUserModule } from "@app/user";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { BusinessChatReportEntity } from "./b-chat-report.entity";
import { BusinessChatReportLoader } from "./b-chat-report.loader";
import { BusinessChatReportResolver } from "./b-chat-report.resolver";
import { BusinessChatReportService } from "./b-chat-report.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([BusinessChatReportEntity, BusinessChatChannelEntity, BusinessChatMessageEntity]),
        ConfigModule,
        AuthModule,
        BaseUserModule,
        FileModule,
    ],
    providers: [
        BusinessChatReportService,
        BusinessChatReportLoader,
        BusinessChatReportResolver,
    ],
    exports: [BusinessChatReportService]
})
export class BusinessChatReportModule { }
