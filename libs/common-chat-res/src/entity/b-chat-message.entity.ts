import { BusinessChatChannelEntity, ChatMessageType } from "@app/common-chat-res";
import { UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Check, Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";


/**
 * 비즈니스채팅 메시지
 * @module BusinessChatModule
 */
@Entity({ name: "b_chat_messages", orderBy: { createdAt: "DESC", id: "ASC" } })
@Check(`"type" = 'TEXT' AND "message" IS NOT NULL OR "type" != 'TEXT'`)
export class BusinessChatMessageEntity extends DefaultEntity {
    /** 작성자 */
    @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
    author?: UserEntity;

    /** 작성자 ID */
    @RelationId((message: BusinessChatMessageEntity) => message.author)
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
    @ManyToOne(type => BusinessChatChannelEntity, { onDelete: "SET NULL" })
    channel: BusinessChatChannelEntity;

    /** 채널 ID */
    @RelationId((message: BusinessChatMessageEntity) => message.channel)
    channelId: string;

    /** 읽은 사용자 */
    @ManyToMany(type => UserEntity, { onDelete: "SET NULL" })
    @JoinTable()
    readUsers: UserEntity[];
}