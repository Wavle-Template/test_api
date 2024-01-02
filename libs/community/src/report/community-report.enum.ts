import { registerEnumType } from "@nestjs/graphql";

export enum CommunityReportType {
    POST = "POST",
    REPLT = "REPLT"
}

registerEnumType(CommunityReportType, {
    name: "CommunityReportType",
    valuesMap: {
        POST: { description: "게시글" },
        REPLT: { description: "댓글" }
    }
})

export enum CommunityReportCategory {
    ABUSIVE = "ABUSIVE",
    SENSUALITY = "SENSUALITY",
    ETC = "ETC"

}

registerEnumType(CommunityReportCategory, {
    name: "CommunityReportCategoryEnumType",
    valuesMap: {
        ABUSIVE: { description: "욕설" },
        SENSUALITY: { description: "선정성" },
        ETC: { description: "기타" },
    },
});

export enum CommunityReportState {
    PENDING = "PENDING",
    PROCESSING = "PROCESSING",
    COMPLETE = "COMPLETE",
}

registerEnumType(CommunityReportState, {
    name: "CommunityReportStateEnumType",
    valuesMap: {
        PENDING: { description: "대기중" },
        PROCESSING: { description: "처리중" },
        COMPLETE: { description: "완료" },
    },
});
