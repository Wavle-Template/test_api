import { AuthModule } from "@app/auth";
import { MatchPostModule } from "@app/match/match.module";
import { BaseNotificationModule } from "@app/notification";
import { BaseUserModule } from "@app/user";
import { Module } from "@nestjs/common";
import { NotificationModule } from "apps/api/src/notification/notification.module";
import { OneSidedMatchResolver } from "./one-sided-match.resolver";

/** 일방적으로 매칭을 할당하는 프로세스 */
@Module({
    imports: [MatchPostModule, BaseUserModule, BaseNotificationModule, AuthModule],
    providers: [OneSidedMatchResolver]
})
export class OneSidedMatchModule { }