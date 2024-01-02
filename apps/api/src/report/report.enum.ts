import { registerEnumType } from "@nestjs/graphql";

export enum ReportCategory {
  USER = "USER",
}

registerEnumType(ReportCategory, {
  name: "ReportCategoryEnumType",
  valuesMap: {
    USER: { description: "사용자 신고" },
  },
});

export enum ReportState {
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  COMPLETE = "COMPLETE",
}

registerEnumType(ReportState, {
  name: "ReportStateEnumType",
  valuesMap: {
    PENDING: { description: "대기중" },
    PROCESSING: { description: "처리중" },
    COMPLETE: { description: "완료" },
  },
});
