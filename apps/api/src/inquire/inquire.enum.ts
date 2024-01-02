import { registerEnumType } from "@nestjs/graphql"

export enum InquireState {
    /** 답변 대기중 */
    ACTIVE = "ACTIVE",
    /** 확인중 / 진행중 */
    CHECKING = "CHECKING",
    /** 답변 완료 */
    ANSWERED = "ANSWERED"
}

export enum InquireType {
    /** 일반 */
    COMMON = "COMMON",
}

registerEnumType(InquireState, {
    name: "InquireState",
    description: "문의 상태",
    valuesMap: {
        ACTIVE: { description: "답변 대기중" },
        CHECKING: { description: "확인중 / 진행중" },
        ANSWERED: { description: "답변 완료" }
    }
})

registerEnumType(InquireType, {
    name: "InquireType",
    description: "문의 종류",
    valuesMap: {
        COMMON: { description: "일반" }
    }
})