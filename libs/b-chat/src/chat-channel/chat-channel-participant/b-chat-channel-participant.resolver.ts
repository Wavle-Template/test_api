/**
 * @module ChatModule
 */
import { Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { User } from "@app/user/user.model";
import { BChatChannelParticipant } from "./b-chat-channel-participant.model";
import { BChatChannelParticipantLoader } from "./b-chat-channel-participant.loader";
import { BChatChannel } from "../b-chat-channel.model";
import { BusinessChatChannelParticipantEntity } from "@app/common-chat-res";

/**
 * 비즈니스 채팅 참여자 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => BChatChannelParticipant)
export class BusinessChatChannelParticipantResolver {
    /**
     * @param participantLoader 참여자 데이터 로더
     */
    constructor(public participantLoader: BChatChannelParticipantLoader) { }

    @ResolveField(type => BChatChannel, { description: "채팅 채널" })
    async channel(@Parent() participant: BusinessChatChannelParticipantEntity): Promise<BChatChannel> {
        return this.participantLoader.getChannel(participant.id) as Promise<BChatChannel>;
    }

    @ResolveField(type => User, { description: "사용자" })
    async user(@Parent() participant: BusinessChatChannelParticipantEntity): Promise<User> {
        return this.participantLoader.getUser(participant.id);
    }
}
