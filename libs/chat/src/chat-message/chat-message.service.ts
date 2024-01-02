/**
 * @module ChatModule
 */
import { Inject, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { BaseNotificationService } from "@app/notification";
import { AbsChatMessageService, ChatChannelEntity, ChatMessageEntity } from "@app/common-chat-res";
import { CHAT_MODULE_PUB_SUB, MESSAGE_RECEIVED } from "../chat.const";

/**
 * 채팅 메시지를 전송하고 관리하는 서비스
 * @category Provider
 */
@Injectable()
export class ChatMessageService extends AbsChatMessageService<ChatMessageEntity> {
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    @Inject(CHAT_MODULE_PUB_SUB) pubSub: RedisPubSub,
    notificationService: BaseNotificationService,
  ) {
    super(entityManager, pubSub, MESSAGE_RECEIVED, notificationService, ChatChannelEntity);
  }
}
