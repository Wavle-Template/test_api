import { AuthModule } from "@app/auth";
import { MatchPostCoreModule } from "@app/match/post/match-post.core.module";
import { BaseNotificationModule } from "@app/notification";
import { BaseUserModule } from "@app/user";
import { Module } from "@nestjs/common";
import { BusinessChatModule } from "../b-chat.module";
import { BusinessChatReportModule } from "../report/b-chat-report.module";
import { BChatChannelWidthMatchResolver } from "../resolvers/b-chat-channel-withd-match.resolver";

@Module({
    imports: [
        MatchPostCoreModule, BaseUserModule, BaseNotificationModule,
        BusinessChatModule, BusinessChatReportModule, AuthModule],
    providers: [BChatChannelWidthMatchResolver]
})
export class BusinessChatWidthMatchModule { }