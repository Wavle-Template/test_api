/**
 * @module ChatModule
 */
import { AbsChatChannelService, ChatChannelEntity, ChatChannelParticipantEntity } from "@app/common-chat-res";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";

/**
 * 채팅 채널을 관리하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class ChatChannelService extends AbsChatChannelService<ChatChannelEntity, ChatChannelParticipantEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, ChatChannelEntity, ChatChannelParticipantEntity);
  }
}
