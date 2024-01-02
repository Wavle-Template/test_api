import { AuthModule } from "@app/auth";
import { ChatChannelEntity, ChatMessageEntity } from "@app/common-chat-res";
import { FileModule } from "@app/file";
import { BaseUserModule } from "@app/user";
import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ChatReportEntity } from "./chat-report.entity";
import { ChatReportLoader } from "./chat-report.loader";
import { ChatReportResolver } from "./chat-report.resolver";
import { ChatReportService } from "./chat-report.service";

@Module({
    imports: [
        TypeOrmModule.forFeature([ChatReportEntity, ChatChannelEntity, ChatMessageEntity]),
        ConfigModule,
        AuthModule,
        BaseUserModule,
        FileModule,
    ],
    providers: [
        ChatReportService,
        ChatReportLoader,
        ChatReportResolver,
    ],
    exports: [ChatReportService, ChatReportLoader]
})
export class ChatReportModule { }
