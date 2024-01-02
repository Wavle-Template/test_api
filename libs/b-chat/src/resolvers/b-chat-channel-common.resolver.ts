import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UserRole } from "@app/entity";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Resolver } from "@nestjs/graphql";
import { BChatChannelCreateInput } from "../chat-channel/b-chat-channel.input";
import { BChatChannel } from "../chat-channel/b-chat-channel.model";
import { IBusinessChatChannelEssentialMutation } from "../chat-channel/b-chat-channel.resolver.interface";
import dedent from "dedent";
import { BaseUserService } from "@app/user";
import { BusinessChatChannelService } from "../chat-channel/b-chat-channel.service";
import { BusinessChatChannelLoader } from "../chat-channel/b-chat.channel.loader";
import { BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, ChatChannelLogic } from "@app/common-chat-res";

@Resolver()
export class BChatChannelCommonResolver implements IBusinessChatChannelEssentialMutation {

    #chatChannelLogic: ChatChannelLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity>
    constructor(
        public bchatChannelService: BusinessChatChannelService,
        public chatChannelLoader: BusinessChatChannelLoader,
        public userService: BaseUserService,
    ) {
        this.#chatChannelLogic = new ChatChannelLogic<BusinessChatChannelEntity, BusinessChatChannelParticipantEntity>(bchatChannelService, userService)
    }
    
    @Mutation(returns => BChatChannel, {
        name: "createBusinessChatChannelForAdmin",
        description: dedent`
      임의로 비즈니스 채널을 생성합니다. 관리자만 사용할 수 있습니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async createChatChannelForAdmin(
        @Args("data", { description: "채널 생성 데이터" }) data: BChatChannelCreateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatChannel> {
        return await this.#chatChannelLogic.createChatChannelForAdmin(data, jwtPayload)
    }

    @Mutation(returns => BChatChannel, {
        name: "createDMBusinessChannel",
        description: dedent`
      1:1 비즈니스 채널(DM) 생성합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않은 유저입니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
    })
    @UseGuards(JwtGuard)
    async createDMChannel(
        @Args("otherUserId", { type: () => ID, description: "상대방 사용자 ID" }) otherUserId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    ): Promise<BChatChannel> {
        return await this.#chatChannelLogic.createDMChannel(otherUserId, jwtPayload)
    }
}