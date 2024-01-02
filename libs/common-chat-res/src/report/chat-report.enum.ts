import { registerEnumType } from "@nestjs/graphql";

export enum ChatReportType {
    CHANNEL = "CHANNEL",
    MESSAGE = "MESSAGE"
}

registerEnumType(ChatReportType, {
    name: "ChatReportType",
    valuesMap: {
        CHANNEL: { description: "채팅방" },
        MESSAGE: { description: "메시지" }
    }
})

export enum ChatReportCategory {
    ABUSIVE = "ABUSIVE",
    SENSUALITY = "SENSUALITY",
    ETC = "ETC"

}

registerEnumType(ChatReportCategory, {
    name: "ChatReportCategory",
    valuesMap: {
        ABUSIVE: { description: "욕설" },
        SENSUALITY: { description: "선정성" },
        ETC: { description: "기타" },
    },
});

export enum ChatReportState {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETE = "COMPLETE",
}

registerEnumType(ChatReportState, {
    name: "ChatReportState",
    valuesMap: {
        PENDING: { description: "대기중" },
        PROCESSING: { description: "처리중" },
        COMPLETE: { description: "완료" },
    },
});
