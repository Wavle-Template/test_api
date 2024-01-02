import { registerEnumType } from "@nestjs/graphql";

export enum MatchPostStateEnum {
    /** 진행중 */
    IN_PROGRESS = "IN_PROGRESS",
    /** 예약중 */
    IN_RESERVATION = "IN_RESERVATION",
    /** 거래완료 */
    DEAL_DONE = "DEAL_DONE",
    // REVIEW_DONE = "REVIEW_DONE"
}

registerEnumType(MatchPostStateEnum, {
    name: "MatchPostStateEnum",
    valuesMap: {
        IN_PROGRESS: { description: "진행중" },
        IN_RESERVATION: { description: "예약중" },
        DEAL_DONE: { description: "거래완료" },
        // REVIEW_DONE: { description: "리뷰 완료" }
    }
});