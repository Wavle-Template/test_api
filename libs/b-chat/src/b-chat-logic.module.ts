import { BusinessChatChannelEntity, BusinessChatChannelParticipantEntity } from '@app/common-chat-res';
import { BusinessChatMessageEntity } from '@app/common-chat-res/entity/b-chat-message.entity';
import { BaseNotificationModule } from '@app/notification';
import { BaseUserModule } from '@app/user';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLJSON } from '@yumis-coconudge/common-module';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import Redis from 'ioredis';
import { B_CHAT_MODULE_PUB_SUB } from './b-chat.const';
import { BusinessChatService } from './b-chat.service';
import { BusinessChatChannelService } from './chat-channel/b-chat-channel.service';
import { BusinessChatMessageService } from './chat-message/b-chat-message.service';

/**
 * 비즈니스 채팅 관련 로직처리 모듈
 * @module BusinessChatModule
 */
@Module({
    imports: [
        TypeOrmModule.forFeature([BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity]),
        ConfigModule, BaseNotificationModule, BaseUserModule],
    providers: [
        {
            provide: B_CHAT_MODULE_PUB_SUB,
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
        GraphQLJSON,
        BusinessChatChannelService,
        BusinessChatMessageService,
        BusinessChatService
    ],

    exports: [BusinessChatService, BusinessChatMessageService, BusinessChatChannelService],
})
export class BusinessChatLogicModule { }
