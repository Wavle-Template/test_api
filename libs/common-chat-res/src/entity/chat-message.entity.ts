/**
 * @module ChatModule
 */
import { UserEntity } from "@app/entity";
import { EssentialEntity } from "@yumis-coconudge/common-module";
import { Check, Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { ChatMessageType } from "../../../common-chat-res/src/message/chat-message.enum";
import { ChatChannelEntity } from "./chat-channel.entity";

/**
 * 채팅 메시지 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "chat_messages", orderBy: { createdAt: "DESC", id: "ASC" } })
@Check(`"type" = 'TEXT' AND "message" IS NOT NULL OR "type" != 'TEXT'`)
export class ChatMessageEntity extends EssentialEntity {
  /** 작성자 */
  @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
  author?: UserEntity;

  /** 작성자 ID */
  @RelationId((message: ChatMessageEntity) => message.author)
  authorId?: string;

  /** 내용 */
  @Column({ nullable: true })
  message?: string;

  /** 종류 */
  @Column({ default: ChatMessageType.TEXT })
  type: string;

  /** 추가 데이터 */
  @Column("jsonb", { nullable: true })
  payload?: Record<string, unknown>;

  /** 채널 */
  @ManyToOne(type => ChatChannelEntity, { onDelete: "SET NULL" })
  channel: ChatChannelEntity;

  /** 채널 ID */
  @RelationId((message: ChatMessageEntity) => message.channel)
  channelId: string;

  /** 읽은 사용자 */
  @ManyToMany(type => UserEntity, { onDelete: "SET NULL" })
  @JoinTable()
  readUsers: UserEntity[];
}
