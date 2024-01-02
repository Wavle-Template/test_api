/**
 * @module ChatModule
 */
import { UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import {
  Column,
  Entity,
  ManyToOne,
  RelationId,
} from "typeorm";
import { ChatChannelEntity } from "./chat-channel.entity";

/**
 * 채팅 채널 참여자 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "chat_channels_participants", orderBy: { createdAt: "DESC", id: "ASC" } })
export class ChatChannelParticipantEntity extends DefaultEntity {

  /** 참여한 채널 */
  @ManyToOne(type => ChatChannelEntity, channel => channel.participants, { onDelete: "SET NULL" })
  channel: ChatChannelEntity;

  /** 참여한 채널 ID */
  @RelationId((participant: ChatChannelParticipantEntity) => participant.channel)
  channelId: string;

  /** 참여한 사용자 */
  @ManyToOne(type => UserEntity, { onDelete: "SET NULL" })
  user: UserEntity;

  /** 참여한 사용자 ID */
  @RelationId((participant: ChatChannelParticipantEntity) => participant.user)
  userId: string;

  /** 참여자의 채널 목록의 최상단 고정 여부 */
  @Column({ default: false })
  isPinned: boolean;
}
