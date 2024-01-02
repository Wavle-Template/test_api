/**
 * @module BusinessChatModule
 */
import { AbsChatChannelService, BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, ChatChannelState } from "@app/common-chat-res";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, Not } from "typeorm";

/**
 * 채팅 채널을 관리하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class BusinessChatChannelService extends AbsChatChannelService<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity> {
    constructor(@InjectEntityManager() entityManager: EntityManager) {
        super(entityManager, BusinessChatChannelEntity, BusinessChatChannelParticipantEntity);
    }


    async updateInActiveFailChannels(targetId: string, choiceChannelId: string, transactionManager?: EntityManager): Promise<BusinessChatChannelEntity[]> {
        return await this.useTransaction(async manager => {
            await manager.update(BusinessChatChannelEntity, {
                targetId: targetId,
                id: Not(choiceChannelId)
            }, {
                state: ChatChannelState.INACTIVE
            });

            return await manager.find(BusinessChatChannelEntity, {
                where: {
                    targetId: targetId,
                    id: Not(choiceChannelId),
                    state: ChatChannelState.INACTIVE
                },
                relations: ["participants"]
            })
        }, transactionManager)
    }
}
