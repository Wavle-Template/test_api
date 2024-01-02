import { AuthModule } from "@app/auth";
import { BaseUserModule } from "@app/user";
import { Module } from "@nestjs/common";
import { BusinessChatModule } from "../b-chat.module";
import { BusinessChatReportModule } from "../report/b-chat-report.module";
import { BChatChannelCommonResolver } from "../resolvers/b-chat-channel-common.resolver";

@Module({
    imports: [BusinessChatModule, BusinessChatReportModule, BaseUserModule, AuthModule],
    providers: [BChatChannelCommonResolver]
})
export class BusinessChatCommonModule { }