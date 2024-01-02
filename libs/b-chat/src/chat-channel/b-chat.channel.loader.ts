/**
 * @module ChatModule
 */
import LRUCache from "lru-cache";
import DataLoader from "dataloader";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, In, Repository } from "typeorm";
import { FileEntity, UserEntity } from "@app/entity";
import { BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, ChatMessageType } from "@app/common-chat-res";
import { BusinessChatMessageEntity } from "@app/common-chat-res/entity/b-chat-message.entity";

/**
 * 채널의 Resolve Field 데이터를 조회하기 위한 데이터로더
 * @category Provider
 */
@Injectable()
export class BusinessChatChannelLoader {
    /** TypeORM 리포지토리 */
    #repository: Repository<BusinessChatChannelEntity>;
    /** 생성자 데이터 로더 */
    #creator: DataLoader<string, UserEntity>;
    /** 참여자 데이터 로더 */
    #participants: DataLoader<string, BusinessChatChannelParticipantEntity[]>;
    /** 읽지 않은 메시지 수 데이터 로더 */
    #unreadMessageCount: DataLoader<{ channelId: string; userId: string }, number>;
    /** 마지막 메시지 데이터 로더 */
    #lastMessage: DataLoader<string, BusinessChatMessageEntity>;
    /** 파일 목록 데이터 로더 */
    #files: DataLoader<string, FileEntity[]>;
    /** 이미지 목록 데이터 로더 */
    #images: DataLoader<string, FileEntity[]>;
    /** 비디오 목록 데이터 로더 */
    #videos: DataLoader<string, FileEntity[]>;

    /**
     * @param entityManager TypeORM 엔티티 매니저
     */
    constructor(@InjectEntityManager() entityManager: EntityManager) {
        this.#repository = entityManager.getRepository(BusinessChatChannelEntity);

        this.#creator = new DataLoader(
            async (keys: string[]) => {
                const channels = await this.#repository.find({
                    where: { id: In(keys) },
                    relations: ["creator"],
                    select: ["id", "creator"],
                });

                return keys.map(key => channels.find(channel => channel.id === key)?.creator);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );

        this.#participants = new DataLoader(
            async (keys: string[]) => {
                const channels = await this.#repository.find({
                    where: { id: In(keys) },
                    relations: ["participants"],
                    select: ["id", "participants"],
                });

                return keys.map(key => channels.find(channel => channel.id === key)?.participants ?? []);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );

        this.#unreadMessageCount = new DataLoader(
            async (keys: { channelId: string; userId: string }[]) => {
                const channelIds = keys.map(key => key.channelId);
                const userIds = keys.map(key => key.userId);

                const rows: { channel_id: string; count: number }[] = await this.#repository
                    .createQueryBuilder("chat_channels")
                    .select("chat_channels.id", "channel_id")
                    .addSelect("COUNT(chat_messages.id)", "count")
                    .where("chat_channels.id IN (:...channelIds)", { channelIds: channelIds })
                    .leftJoin("chat_channels.messages", "chat_messages")
                    .leftJoin("chat_messages.readUsers", "read_user", "read_user.id NOT IN (:...userIds)", {
                        userIds: userIds,
                    })
                    .leftJoin("chat_channels.participants", "participant", "participant.createdAt < chat_messages.createdAt")
                    .andWhere("read_user.id = participant.userId")
                    .groupBy("chat_channels.id")
                    .orderBy("chat_channels.id")
                    .getRawMany();

                return keys.map(key => rows.find(row => row.channel_id === key.channelId)?.count ?? 0);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );

        this.#lastMessage = new DataLoader(
            async (keys: string[]) => {
                const messages = await this.#repository.manager
                    .createQueryBuilder(BusinessChatMessageEntity, "a")
                    .leftJoin(
                        qb =>
                            qb
                                .subQuery()
                                .select("chat_messages.channelId")
                                .addSelect("MAX(chat_messages.createdAt)", "max")
                                .from(BusinessChatMessageEntity, "chat_messages")
                                .orderBy("chat_messages.channelId")
                                .groupBy("chat_messages.channelId"),
                        "b",
                        `"a"."channelId" = "b"."channelId" AND "a"."createdAt" = "b"."max"`,
                    )
                    .where(`"a"."channelId" IN (:...keys)`, { keys: keys })
                    .getMany();

                return keys.map(key => messages.find(message => message.channelId === key));
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );

        this.#files = new DataLoader(
            async (keys: string[]) => {
                const messages = await this.#repository.manager.find(BusinessChatMessageEntity, {
                    where: { channel: { id: In(keys) }, type: ChatMessageType.FILE },
                });

                const files = await this.#repository.manager.find(FileEntity, {
                    id: In(messages.map(message => message.payload.id) as string[]),
                });

                let fileMap: Record<string, FileEntity[]> = {};
                for (const message of messages) {
                    const channelId = message.id;
                    const attachedFiles = files.filter(file => file.id === message.payload.id);
                    if (fileMap[channelId] == null) fileMap = { ...fileMap, [channelId]: attachedFiles };
                    fileMap = { ...fileMap, [channelId]: [...fileMap[channelId], ...attachedFiles] };
                }

                return keys.map(key => fileMap[key]);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );

        this.#images = new DataLoader(
            async (keys: string[]) => {
                const messages = await this.#repository.manager.find(BusinessChatMessageEntity, {
                    where: { channel: { id: In(keys) }, type: ChatMessageType.IMAGE },
                });

                const files = await this.#repository.manager.find(FileEntity, {
                    id: In(messages.map(message => message.payload.id) as string[]),
                });

                let fileMap: Record<string, FileEntity[]> = {};
                for (const message of messages) {
                    const channelId = message.id;
                    const attachedFiles = files.filter(file => file.id === message.payload.id);
                    if (fileMap[channelId] == null) fileMap = { ...fileMap, [channelId]: attachedFiles };
                    fileMap = { ...fileMap, [channelId]: [...fileMap[channelId], ...attachedFiles] };
                }

                return keys.map(key => fileMap[key]);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );

        this.#videos = new DataLoader(
            async (keys: string[]) => {
                const messages = await this.#repository.manager.find(BusinessChatMessageEntity, {
                    where: { channel: { id: In(keys) }, type: ChatMessageType.VIDEO },
                });

                const files = await this.#repository.manager.find(FileEntity, {
                    id: In(messages.map(message => message.payload.id) as string[]),
                });

                let fileMap: Record<string, FileEntity[]> = {};
                for (const message of messages) {
                    const channelId = message.id;
                    const attachedFiles = files.filter(file => file.id === message.payload.id);
                    if (fileMap[channelId] == null) fileMap = { ...fileMap, [channelId]: attachedFiles };
                    fileMap = { ...fileMap, [channelId]: [...fileMap[channelId], ...attachedFiles] };
                }

                return keys.map(key => fileMap[key]);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );
    }

    /**
     * 특정 채널의 생성자 데이터를 가져옵니다.
     * @param id 채널 ID
     * @returns 사용자 엔티티
     */
    async getCreator(id: string): Promise<UserEntity> {
        return this.#creator.load(id);
    }

    /**
     * 특정 채널의 참여자 데이터를 가져옵니다.
     * @param id 채널 ID
     * @returns 참여자 엔티티
     */
    async getParticipants(id: string): Promise<BusinessChatChannelParticipantEntity[]> {
        return this.#participants.load(id);
    }

    /**
     * 특정 채널의 이미지 파일 데이터 목록을 가져옵니다.
     * @param id 채널 ID
     * @returns 이미지 파일 데이터 목록
     */
    async getImages(id: string): Promise<FileEntity[]> {
        return this.#images.load(id);
    }

    /**
     * 특정 채널의 비디오 파일 데이터 목록을 가져옵니다.
     * @param id 채널 ID
     * @returns 비디오 파일 데이터 목록
     */
    async getVideos(id: string): Promise<FileEntity[]> {
        return this.#videos.load(id);
    }

    /**
     * 특정 채널의 기타 파일 데이터 목록을 가져옵니다.
     * @param id 채널 ID
     * @returns 파일 데이터 목록
     */
    async getFiles(id: string): Promise<FileEntity[]> {
        return this.#files.load(id);
    }

    /**
     * 특정 채널의 특정 사용자가 읽지 않은 메시지 수를 확인합니다.
     * @param channelId 채널 ID
     * @param userId 사용자 ID
     * @returns 읽지 않은 메시지 수
     */
    async getUnreadMessageCount(channelId: string, userId: string): Promise<number> {
        return this.#unreadMessageCount.load({ channelId: channelId, userId: userId });
    }

    /**
     * 특정 채널의 마지막(최근) 메시지를 가져옵니다.
     * @param id 채널 ID
     * @returns 마지막(최근)) 메시지
     */
    async getLastMessage(id: string): Promise<BusinessChatMessageEntity> {
        return this.#lastMessage.load(id);
    }
}
