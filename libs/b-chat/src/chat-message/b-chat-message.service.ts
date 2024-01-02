import { BaseNotificationService } from "@app/notification";
import { Inject, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { EntityManager } from "typeorm";
import { B_CHAT_MODULE_PUB_SUB, B_MESSAGE_RECEIVED } from '../b-chat.const'
import { AbsChatMessageService } from "@app/common-chat-res";
import { BusinessChatMessageEntity } from "@app/common-chat-res/entity/b-chat-message.entity";

@Injectable()
export class BusinessChatMessageService extends AbsChatMessageService<BusinessChatMessageEntity> {
    constructor(
        @InjectEntityManager() entityManager: EntityManager,
        @Inject(B_CHAT_MODULE_PUB_SUB) pubSub: RedisPubSub,
        notificationService: BaseNotificationService,
    ) {
        super(entityManager, pubSub, B_MESSAGE_RECEIVED, notificationService, BusinessChatMessageEntity);
    }
}
