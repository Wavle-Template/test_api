/**
 * 채팅방을 만들고 메시지를 전송/수신할 수 있도록 해주는 모듈입니다.
 *
 * ## 다이어그램
 *
 * ```mermaid
 * classDiagram
 * direction LR
 * ConfigModule --> ChatModule : Import
 * NotificationModule --> ChatModule : Import
 * AuthModule --> ChatModule : Import
 * UserModule --> ChatModule : Import
 * ChatModule o-- RedisPubSub : Provide
 * ChatModule o-- ChatChannelService : Provide
 * ChatModule o-- ChatChannelLoader : Provide
 * ChatModule o-- ChatChannelResolver : Provide
 * ChatModule o-- ChatChannelParticipantLoader : Provide
 * ChatModule o-- ChatChannelParticipantResolver : Provide
 * ChatModule o-- ChatMessageService : Provide
 * ChatModule o-- ChatMessageLoader : Provide
 * ChatModule o-- ChatMessageResolver : Provide
 * ChatChannelService <.. EntityManager : Inject
 * ChatChannelLoader <.. EntityManager : Inject
 * ChatChannelResolver <.. ChatChannelService : Inject
 * ChatChannelResolver <.. ChatChannelLoader : Inject
 * ChatChannelResolver <.. UserService : Inject
 * ChatChannelParticipantLoader <.. EntityManager : Inject
 * ChatChannelParticipantResolver <.. ChatChannelParticipantLoader : Inject
 * ChatMessageService <.. EntityManager : Inject
 * ChatMessageService <.. RedisPubSub : Inject
 * ChatMessageService <.. NotificationService : Inject
 * ChatMessageLoader <.. EntityManager : Inject
 * ChatMessageResolver <.. RedisPubSub : Inject
 * ChatMessageResolver <.. ChatMessageService : Inject
 * ChatMessageResolver <.. ChatMessageLoader : Inject
 * ChatMessageResolver <.. ChatChannelService : Inject
 * ChatMessageResolver <.. UserService : Inject
 * ```
 * @module ChatModule
 */
import { Module } from "@nestjs/common";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { ChatChannelLoader } from "./chat-channel/chat-channel.loader";
import { ChatChannelResolveFields, ChatChannelResolver } from "./chat-channel/chat-channel.resolver";
import { ChatChannelService } from "./chat-channel/chat-channel.service";
import { ChatMessageLoader } from "./chat-message/chat-message.loader";
import { ChatMessageResolver } from "./chat-message/chat-message.resolver";
import { ChatMessageService } from "./chat-message/chat-message.service";
import { CHAT_MODULE_PUB_SUB } from "./chat.const";
import Redis from "ioredis";
// import { UserModule } from "../user/user.module";
import { ChatChannelParticipantLoader } from "./chat-channel/chat-channel-participant/chat-channel-participant.loader";
import { ChatChannelParticipantResolver } from "./chat-channel/chat-channel-participant/chat-channel-participant.resolver";
import { ConfigModule, ConfigService } from "@nestjs/config";
// import { NotificationModule } from "../notification/notification.module";
// import { AuthModule } from "@app/auth";
import { GraphQLJSON } from "@yumis-coconudge/common-module";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthModule } from "@app/auth";
import { BaseUserModule } from "@app/user";
import { BaseNotificationModule } from "@app/notification";
import { ChatChannelEntity, ChatMessageEntity, ChatChannelParticipantEntity } from "@app/common-chat-res";
import { ChatReportModule } from "./report/chat-report.module";

/**
 * 채팅 모듈
 * @hidden
 */
@Module({
  imports: [TypeOrmModule.forFeature([ChatChannelEntity, ChatMessageEntity, ChatChannelParticipantEntity]), ConfigModule, BaseNotificationModule, AuthModule, BaseUserModule, ChatReportModule],
  providers: [
    {
      provide: CHAT_MODULE_PUB_SUB,
      useFactory: (configService: ConfigService) => {
        const redisURL = configService.get("REDIS_URL");
        return new RedisPubSub({
          publisher: new Redis(redisURL),
          subscriber: new Redis(redisURL),
          reviver: (_, value) => {
            if (
              typeof value === "string" &&
              value.search(/(19|20)\d\d-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])/g) === 0 &&
              isNaN(Date.parse(value)) === false
            ) {
              return new Date(value);
            }
            return value;
          },
        });
      },
      inject: [ConfigService],
    },
    ChatChannelService,
    ChatChannelLoader,
    ChatChannelResolver,
    ChatChannelResolveFields,
    ChatChannelParticipantLoader,
    ChatChannelParticipantResolver,
    ChatMessageService,
    ChatMessageLoader,
    ChatMessageResolver,
    GraphQLJSON,
  ],
  exports: [ChatChannelService, ChatChannelLoader, ChatChannelParticipantLoader, ChatMessageService, ChatMessageLoader],
})
export class ChatModule { }
