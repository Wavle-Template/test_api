import { registerEnumType } from "@nestjs/graphql";

export enum AdminPostType {
  /** 공지 */
  NOTICE = "NOTICE",
  /** FAQ */
  FAQ = "FAQ",
  /** 배너 */
  BANNER = "BANNER",
  /** 팝업 */
  POPUP = "POPUP",
  /** 이벤트 */
  EVENT = "EVENT"
}

registerEnumType(AdminPostType, {
  name: "AdminPostType",
  description: "관리자가 올린 게시물 타입",
  valuesMap: {
    NOTICE: { description: "공지사항" },
    FAQ: { description: "자주 묻는 질문" },
    BANNER: { description: "배너" },
    POPUP: { description: "팝업" },
    EVENT: { description: "이벤트" }
  },
});

export enum AdminPostState {
  /** 활성화 */
  ACTIVE = "ACTIVE",
  /** 비활성화 */
  INACTIVE = "INACTIVE"
}

registerEnumType(AdminPostState, {
  name: "AdminPostState",
  description: "관리자가 올린 게시물 상태",
  valuesMap: {
    ACTIVE: { description: "활성화" },
    INACTIVE: { description: "비활성화" }
  }
})

export enum AdminPostAction {
  /** 단순 텍스트 표시 */
  TEXT = "TEXT",
  /** 액션 없음 */
  NONE = "NONE",
  /** URL 이동 */
  MOVE_URL = "MOVE_URL",
  /** 페이지 이동 */
  // MOVE_PAGE = "MOVE_PAGE"
}
registerEnumType(AdminPostAction, {
  name: "AdminPostAction",
  description: "관리자 게시글 클릭 액션",
  valuesMap: {
    TEXT: { description: "텍스트 표시" },
    MOVE_URL: { description: "URL 이동" },
    NONE: { description: "액션 없음" }
  }
})