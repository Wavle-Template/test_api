import { ChatChannelState } from "@app/common-chat-res";
import { UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, ManyToOne, OneToMany, RelationId } from "typeorm";
import { BusinessChatMessageEntity } from "./b-chat-message.entity";
import { BusinessChatChannelParticipantEntity } from "./b-chat-channel-participant.entity";

@Entity({ name: "b_chat_channels", orderBy: { updatedAt: "DESC", createdAt: "DESC", id: "ASC" } })
export class BusinessChatChannelEntity extends DefaultEntity {
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
    @RelationId((channel: BusinessChatChannelEntity) => channel.creator)
    creatorId: string;

    /** 참여자 목록 */
    @OneToMany(type => BusinessChatChannelParticipantEntity, participant => participant.channel, { onDelete: "SET NULL" })
    participants: BusinessChatChannelParticipantEntity[];

    /** 메시지 목록 */
    @OneToMany(type => BusinessChatMessageEntity, message => message.channel, { onDelete: "SET NULL" })
    messages: BusinessChatMessageEntity[];

    /** 특정 테이블의 ID */
    @Column({ type: "uuid" })
    targetId: string;
}