/**
 * @module ChatModule
 */
import LRUCache from "lru-cache";
import DataLoader from "dataloader";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, In, Repository } from "typeorm";
import { UserEntity } from "@app/entity";
import { BusinessChatChannelEntity, BusinessChatChannelParticipantEntity } from "@app/common-chat-res";

/**
 * 참여자의 Resolve Field 데이터를 조회하기 위한 데이터로더
 * @category Provider
 */
@Injectable()
export class BChatChannelParticipantLoader {
    /** TypeORM 리포지토리 */
    #repository: Repository<BusinessChatChannelParticipantEntity>;
    /** 채널 데이터 로더 */
    #channel: DataLoader<string, BusinessChatChannelEntity>;
    /** 사용자 데이터 로더 */
    #user: DataLoader<string, UserEntity>;

    /**
     * @param entityManager TypeORM 엔티티 매니저
     */
    constructor(@InjectEntityManager() entityManager: EntityManager) {
        this.#repository = entityManager.getRepository(BusinessChatChannelParticipantEntity);

        this.#channel = new DataLoader(
            async (ids: string[]) => {
                const participants = await this.#repository.find({
                    where: { id: In(ids) },
                    select: ["id", "channel"],
                    relations: ["channel"],
                });

                return ids.map(id => participants.find(participant => participant.id === id).channel);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );

        this.#user = new DataLoader(
            async (ids: string[]) => {
                const participants = await this.#repository.find({
                    where: { id: In(ids) },
                    select: ["id", "user"],
                    relations: ["user"],
                });

                return ids.map(id => participants.find(participant => participant.id === id).user);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );
    }

    /**
     * 특정 참여자의 채널 데이터를 가져옵니다.
     * @param id 채널 참여자 ID
     * @returns 채널 엔티티
     */
    async getChannel(id: string): Promise<BusinessChatChannelEntity> {
        return this.#channel.load(id);
    }

    /**
     * 특정 참여자의 사용자 데이터를 가져옵니다.
     * @param id 채널 참여자 ID
     * @returns 채널 엔티티
     */
    async getUser(id: string): Promise<UserEntity> {
        return this.#user.load(id);
    }
}
