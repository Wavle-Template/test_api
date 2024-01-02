import { registerEnumType } from "@nestjs/graphql";

/**
 * 사용자 역할(종류)
 */
export enum UserRole {
  /** 일반 사용자 */
  MEMBER = "MEMBER",
  /** 관리자 */
  ADMIN = "ADMIN",
}

/**
 * 사용자 상태
 */
export enum UserState {
  /** 가입 대기중 */
  PENDING = "PENDING",
  /** 활성화 */
  ACTIVE = "ACTIVE",
  /** 비활성화 - 휴면계정 */
  INACTIVE = "INACTIVE",
  /** 정지 */
  SUSPENDED = "SUSPENDED",
  /** 탈퇴 */
  LEAVED = "LEAVED"
}


registerEnumType(UserRole, {
  name: "UserRole",
  description: "사용자 권한",
  valuesMap: {
    MEMBER: { description: "일반 사용자" },
    ADMIN: { description: "관리자" },
  },
});

registerEnumType(UserState, {
  name: "UserState",
  description: "사용자 상태",
  valuesMap: {
    PENDING: {
      description: "가입 대기중"
    },
    ACTIVE: {
      description: "활성화 상태"
    },
    INACTIVE: {
      description: "비활성화 상태 - 휴면계정"
    },
    SUSPENDED: {
      description: "정지"
    },
    LEAVED: {
      description: "탈퇴상태"
    }
  }
})