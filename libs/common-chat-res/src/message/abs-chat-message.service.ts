import { UserEntity, UserBlockEntity } from "@app/entity";
import { NotificationType } from "@app/entity/notification/notification.enum";
import { BaseNotificationService } from "@app/notification";
import { BadRequestException } from "@nestjs/common";
import { CRUDService, EssentialEntity, getCount, getEdges, getPageInfo } from "@yumis-coconudge/common-module";
import { FilterArgs, MixedArgs, Edge, PageInfo } from "@yumis-coconudge/typeorm-helper";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { EntityManager, EntityTarget, In, DeepPartial } from "typeorm";
import { ChatChannelState } from "../channel/chat-channel.enum";
import { BusinessChatMessageEntity } from "../entity/b-chat-message.entity";
import { ChatChannelEntity } from "../entity/chat-channel.entity";
import { ChatMessageEntity } from "../entity/chat-message.entity";

export class AbsChatMessageService<TEntity extends ChatMessageEntity | BusinessChatMessageEntity> extends CRUDService<TEntity>{
    /** Redis PubSub 클라이언트 */
    #pubSub: RedisPubSub;
    /** 알림 서비스 */
    #notificationService: BaseNotificationService;

    /**
     * @param entityManager TypeORM 엔티티 매니저
     * @param pubSub Redis PubSub 클라이언트
     * @param notificationService  알림 서비스
     */
    constructor(
        entityManager: EntityManager,
        pubSub: RedisPubSub,
        public RECEIVED_KEY: string,
        notificationService: BaseNotificationService,
        public inputEntityTarget: EntityTarget<TEntity>
    ) {
        super(entityManager, inputEntityTarget);
        this.#pubSub = pubSub;
        this.#notificationService = notificationService;
    }

    /**
     * 채팅 메시지 ID 목록을 이용해 다수의 채팅 메시지를 조회합니다.
     * @param ids 조회할 채팅 메시지 ID 목록
     * @param relations 릴레이션
     * @returns 채팅 메시지 엔티티 목록
     */
    async findByIds(ids: string[], relations?: string[]): Promise<TEntity[]> {
        return this.repository.find({ where: { id: In(ids) }, relations: relations });
    }

    /**
     * 채팅 메시지를 전송합니다.
     * @param data 보낼 채팅 메시지 데이터
     * @returns 채팅 메시지 엔티티
     */
    async send(data: Omit<DeepPartial<TEntity>, keyof EssentialEntity>, transactionManager?: EntityManager): Promise<TEntity> {
        return await this.useTransaction(async manager => {
            const author = await manager.findOneOrFail(UserEntity, data.author.id);
            let channel = await manager.findOneOrFail(ChatChannelEntity, data.channel.id, {
                relations: ["participants", "participants.user"],
            });

            if (channel.state === ChatChannelState.INACTIVE || channel.participants.length <= 1)
                throw new BadRequestException();

            let message = manager.create(this.inputEntityTarget, data as any);
            message = await manager.save(message);

            await this.#pubSub.publish(this.RECEIVED_KEY, message);
            const notificationRecipients = channel.participants
                .filter(participant => participant.user.id !== author.id)
                .map(pariticpant => pariticpant.user);
            await this.#notificationService.send({
                title: `${author.nickname ?? author.name}님의 메시지`,
                message: data.message,
                type: NotificationType.CHAT,
                relationId: channel.id,
                recipients: notificationRecipients,
            });

            channel.updatedAt = new Date();
            channel = await manager.save(channel);
            return await manager.findOne(this.inputEntityTarget, message.id);
        }, transactionManager)

    }

    /**
     * 특정 채널의 특정 사용자의 모든 메시지를 읽음 처리합니다.
     * @param channelId 채널 ID
     * @param userId 사용자 ID
     */
    async readAll(channelId: string, userId: string): Promise<void> {
        return this.entityManager.transaction(async manager => {
            let messages = await manager.find(this.inputEntityTarget, {
                where: { channel: { id: channelId } },
                relations: ["readUsers"],
            });

            messages = messages.map(message =>
                manager.merge(this.inputEntityTarget, message, { readUsers: [...message.readUsers, { id: userId }] } as any),
            );
            await manager.save(messages);
        });
    }

    async countByChannel(channelId: string, userId: string, args: FilterArgs): Promise<number> {
        const builder = this.getQueryBuilder("chat_messages")
            .leftJoin("chat_messages.author", "author")
            .leftJoin(UserBlockEntity, "blocks", "blocks.sourceId = :userId AND blocks.destinationId = author.id", {
                userId: userId,
            })
            .where("chat_messages.channelId = :channelId", { channelId: channelId });

        return getCount(builder, args);
    }

    async getEdgesByChannel(channelId: string, userId: string, args: MixedArgs): Promise<Edge<TEntity>[]> {
        const builder = this.getQueryBuilder("chat_messages")
            .leftJoin("chat_messages.author", "author")
            .leftJoin(UserBlockEntity, "blocks", "blocks.sourceId = :userId AND blocks.destinationId = author.id", {
                userId: userId,
            })
            .where("chat_messages.channelId = :channelId", { channelId: channelId });

        return getEdges(builder, args);
    }

    async getPageInfoByChannel(
        channelId: string,
        userId: string,
        edges: Edge<TEntity>[],
        args: MixedArgs,
    ): Promise<PageInfo> {
        const builder = this.getQueryBuilder("chat_messages")
            .leftJoin("chat_messages.author", "author")
            .leftJoin(UserBlockEntity, "blocks", "blocks.sourceId = :userId AND blocks.destinationId = author.id", {
                userId: userId,
            })
            .where("chat_messages.channelId = :channelId", { channelId: channelId });

        return getPageInfo(builder, edges, args);
    }
}