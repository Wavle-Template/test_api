import { UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { BusinessChatChannelEntity } from "./b-chat-channel.entity";

/**
 * 비즈니스 채팅 참여자
 * @module BusinessChatModule
 */
@Entity({ name: "b_chat_channels_participants", orderBy: { createdAt: "DESC", id: "ASC" } })
export class BusinessChatChannelParticipantEntity extends DefaultEntity {
    
    /** 참여한 채널 */
    @ManyToOne(type => BusinessChatChannelEntity, channel => channel.participants, { onDelete: "SET NULL" })
    channel: BusinessChatChannelEntity;

    /** 참여한 채널 ID */
    @RelationId((participant: BusinessChatChannelParticipantEntity) => participant.channel)
    channelId: string;

    /** 참여한 사용자 */
    @ManyToOne(type => UserEntity, { onDelete: "SET NULL" })
    user: UserEntity;

    /** 참여한 사용자 ID */
    @RelationId((participant: BusinessChatChannelParticipantEntity) => participant.user)
    userId: string;

    /** 참여자의 채널 목록의 최상단 고정 여부 */
    @Column({ default: false })
    isPinned: boolean;

}