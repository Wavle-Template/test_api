/**
 * @module ChatModule
 */
import LRUCache from "lru-cache";
import DataLoader from "dataloader";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, In, Repository } from "typeorm";
import { UserEntity } from "@app/entity";
import { ChatMessageEntity, ChatChannelEntity } from "@app/common-chat-res";

/**
 * 채팅 메시지의 Resolve Field를 처리하기 위한 데이터 로더
 * @category Provider
 */
@Injectable()
export class ChatMessageLoader {
  /** TypeORM 리포지토리 */
  #repository: Repository<ChatMessageEntity>;
  /** 작성자 데이터 로더 */
  #author: DataLoader<string, UserEntity>;
  /** 채팅 채널 데이터 로더 */
  #channel: DataLoader<string, ChatChannelEntity>;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   */
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    this.#repository = entityManager.getRepository(ChatMessageEntity);

    this.#author = new DataLoader(
      async (keys: string[]) => {
        const messages = await this.#repository.find({
          where: { id: In(keys) },
          relations: ["author"],
          select: ["id", "author"],
        });

        return keys.map(key => messages.find(message => message.id === key).author);
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );

    this.#channel = new DataLoader(
      async (keys: string[]) => {
        const messages = await this.#repository.find({
          where: { id: In(keys) },
          relations: ["channel"],
          select: ["id", "channel"],
        });

        return keys.map(key => messages.find(message => message.id === key).channel);
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );
  }

  /**
   * 특정 메시지의 작성자 데이터를 가져옵니다.
   * @param id 메시지 ID
   * @returns 사용자 엔티티
   */
  async getAuthor(id: string): Promise<UserEntity> {
    return this.#author.load(id);
  }

  /**
   * 특정 메시지의 채널 데이터를 가져옵니다.
   * @param id 메시지 ID
   * @returns 채팅 채널 엔티티
   */
  async getChannel(id: string): Promise<ChatChannelEntity> {
    return this.#channel.load(id);
  }
}
