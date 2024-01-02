/**
 * @module ChatModule
 */
import { registerEnumType } from "@nestjs/graphql";

/** 채널 상태 */
export enum ChatChannelState {
  /** 활성화 */
  ACTIVE = "ACTIVE",
  /** 비활성화 */
  INACTIVE = "INACTIVE",
}

registerEnumType(ChatChannelState, {
  name: "ChatChannelState",
  description: "채팅방 상태",
  valuesMap: {
    ACTIVE: { description: "활성화" },
    INACTIVE: { description: "비활성화" },
  },
});

/** 채널 종류 */
export enum ChatChannelType {
  /** 1:1(DM) 채팅 */
  DM = "DM",
  /** 1:N 채팅 */
  ROOM = "ROOM",
}

registerEnumType(ChatChannelType, {
  name: "ChatChannelType",
  description: "채팅방 타입",
  valuesMap: {
    DM: { description: "1:1(DM) 채팅" },
    ROOM: { description: "1:N 채팅" }
  },
});
