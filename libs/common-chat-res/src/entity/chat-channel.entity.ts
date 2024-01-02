/**
 * @module ChatModule
 */
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { UserEntity } from "@app/entity";
import { ChatChannelParticipantEntity, ChatChannelState } from "@app/common-chat-res";
import { ChatMessageEntity } from "./chat-message.entity";

/**
 * 채팅 채널 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "chat_channels", orderBy: { updatedAt: "DESC", createdAt: "DESC", id: "ASC" } })
export class ChatChannelEntity extends DefaultEntity {
  /** 상태 */
  @Column({ default: ChatChannelState.ACTIVE })
  state: string;

  /** 공개 여부 */
  @Column({ nullable: true })
  isVisible?: boolean;

  /** 종류 */
  @Column({ nullable: true })
  type?: string;

  /** 생성자 */
  @ManyToOne(type => UserEntity, { nullable: true })
  creator: UserEntity;

  /** 생성자 ID */
  @RelationId((channel: ChatChannelEntity) => channel.creator)
  creatorId: string;

  /** 참여자 목록 */
  @OneToMany(type => ChatChannelParticipantEntity, participant => participant.channel, { onDelete: "SET NULL" })
  participants: ChatChannelParticipantEntity[];

  /** 메시지 목록 */
  @OneToMany(type => ChatMessageEntity, message => message.channel, { onDelete: "SET NULL" })
  messages: ChatMessageEntity[];
}
