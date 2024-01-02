import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { BChatChannelCreateInput } from "./b-chat-channel.input";
import { BChatChannel } from "./b-chat-channel.model";

export interface IBusinessChatChannelEssentialMutation {
    createChatChannelForAdmin(
        data: BChatChannelCreateInput,
        jwtPayload: AuthTokenPayload
    ): Promise<BChatChannel>;
    createDMChannel(
        otherUserId: string,
        jwtPayload: AuthTokenPayload,
    ): Promise<BChatChannel>;
}