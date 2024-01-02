/**
 * @module ChatModule
 */
import { registerEnumType } from "@nestjs/graphql";

/**
 * 파일 메시지 종류
 */
export enum ChatMessageFileType {
  IMAGE = "IMAGE",
  /** 비디오 */
  VIDEO = "VIDEO",
  /** 기타 파일 */
  FILE = "FILE",
}

registerEnumType(ChatMessageFileType, {
  name: "ChatMessageFileType",
  description: "채팅 Payload file types",
  valuesMap: {
    IMAGE: { description: "이미지" },
    VIDEO: { description: "비디오" },
    FILE: { description: "기타 파일" },
  }
})

/**
 * 텍스트 메시지 종류
 */
export enum ChatMessageTextType {
  /** 시스템 */
  SYSTEM = "SYSTEM",
  /** 텍스트 */
  TEXT = "TEXT",
}

/**
 * 액션 메시지 종류
 */
export enum ChatMessageActionType {
  /** 카드형 */
  CARD = "CARD",
  /** 링크 */
  LINK = "LINK",
}

/**
 * 채팅 메시지 종류
 */
export enum ChatMessageType {
  /** 시스템 */
  SYSTEM = "SYSTEM",
  /** 카드형 */
  CARD = "CARD",
  /** 텍스트 */
  TEXT = "TEXT",
  /** 이미지 */
  IMAGE = "IMAGE",
  /** 비디오 */
  VIDEO = "VIDEO",
  /** 기타 파일 */
  FILE = "FILE",
  /** 링크 */
  LINK = "LINK",
}

registerEnumType(ChatMessageType, {
  name: "ChatMessageType",
  description: "채팅 메시지 종류",
  valuesMap: {
    SYSTEM: { description: "시스템" },
    CARD: { description: "카드형" },
    TEXT: { description: "텍스트" },
    IMAGE: { description: "이미지" },
    VIDEO: { description: "비디오" },
    FILE: { description: "기타 파일" },
    LINK: { description: "링크" },
  },
});


