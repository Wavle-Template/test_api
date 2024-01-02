import { ChatReportBaseEntity } from "@app/common-chat-res/report/chat-report.entity";
import { Entity } from "typeorm";

@Entity({ name: "b_chat_reports", orderBy: { createdAt: "DESC", id: "ASC" } })
export class BusinessChatReportEntity extends ChatReportBaseEntity {

}
