import { BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity } from "@app/common-chat-res";
import { ChatChannelLogic } from "@app/common-chat-res/logics/chat-channel.logic";
import { ChatMessageLogic } from "@app/common-chat-res/logics/chat-message.logic";
import { BaseUserService } from "@app/user";
import { Inject, Injectable } from "@nestjs/common";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { B_CHAT_MODULE_PUB_SUB, B_MESSAGE_RECEIVED } from "./b-chat.const";
import { BusinessChatChannelService } from "./chat-channel/b-chat-channel.service";
import { BusinessChatMessageService } from "./chat-message/b-chat-message.service";

/**
 * 비즈니스 채팅 관련 서비스
 * @module BusinessChatModule
 */
@Injectable()
export class BusinessChatService {
    #chatChannelLogic: ChatChannelLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity>;
    #chatMessageLogic: ChatMessageLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity>;
    constructor(
        public bChatChannelService: BusinessChatChannelService,
        public bChatMessageService: BusinessChatMessageService,
        @Inject(B_CHAT_MODULE_PUB_SUB) public pubSub: RedisPubSub,
        public userService: BaseUserService
    ) {
        this.#chatChannelLogic = new ChatChannelLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity>(bChatChannelService, userService)
        this.#chatMessageLogic = new ChatMessageLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity>(bChatMessageService, userService, bChatChannelService, pubSub, B_MESSAGE_RECEIVED);
    }

    get chatChannelLogic() {
        return this.#chatChannelLogic
    }
    get chatMessageLogic() {
        return this.#chatMessageLogic
    }

}