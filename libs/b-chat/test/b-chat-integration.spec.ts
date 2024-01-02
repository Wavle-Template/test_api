import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { BusinessChatModule } from '@app/b-chat';
import { B_CHAT_MODULE_PUB_SUB } from '@app/b-chat/b-chat.const';
import { BusinessChatService } from '@app/b-chat/b-chat.service';
import { BusinessChatChannelResolver } from '@app/b-chat/chat-channel/b-chat-channel.resolver';
import { BusinessChatChannelService } from '@app/b-chat/chat-channel/b-chat-channel.service';
import { BusinessChatChannelLoader } from '@app/b-chat/chat-channel/b-chat.channel.loader';
import { BChatChannelParticipantLoader } from '@app/b-chat/chat-channel/chat-channel-participant/b-chat-channel-participant.loader';
import { BusinessChatChannelParticipantResolver } from '@app/b-chat/chat-channel/chat-channel-participant/b-chat-channel-participant.resolver';
import { BusinessChatMessageLoader } from '@app/b-chat/chat-message/b-chat-message.loader';
import { BusinsessChatMessageResolver } from '@app/b-chat/chat-message/b-chat-message.resolver';
import { BusinessChatMessageService } from '@app/b-chat/chat-message/b-chat-message.service';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity } from '@app/common-chat-res';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';

describe('Business-Chat-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            BusinessChatChannelEntity, BusinessChatChannelParticipantEntity, BusinessChatMessageEntity,
            UserSuspenedLogEntity, SleeperEntity,
            UserArchiveEntity, NotificationEntity,
            NotificationReadEntity
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                BusinessChatModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined BusinessChatChannelService', () => {
        expect(module.get<BusinessChatChannelService>(BusinessChatChannelService)).toBeDefined();
    });

    it('should be defined BusinessChatChannelLoader', () => {
        expect(module.get<BusinessChatChannelLoader>(BusinessChatChannelLoader)).toBeDefined();
    });
    it('should be defined BusinessChatChannelResolver', () => {
        expect(module.get<BusinessChatChannelResolver>(BusinessChatChannelResolver)).toBeDefined();
    });
    it('should be defined BusinessChatChannelParticipantResolver', () => {
        expect(module.get<BusinessChatChannelParticipantResolver>(BusinessChatChannelParticipantResolver)).toBeDefined();
    });
    it('should be defined BChatChannelParticipantLoader', () => {
        expect(module.get<BChatChannelParticipantLoader>(BChatChannelParticipantLoader)).toBeDefined();
    });
    it('should be defined BusinessChatMessageService', () => {
        expect(module.get<BusinessChatMessageService>(BusinessChatMessageService)).toBeDefined();
    });
    it('should be defined BusinessChatMessageLoader', () => {
        expect(module.get<BusinessChatMessageLoader>(BusinessChatMessageLoader)).toBeDefined();
    });
    it('should be defined BusinsessChatMessageResolver', () => {
        expect(module.get<BusinsessChatMessageResolver>(BusinsessChatMessageResolver)).toBeDefined();
    });
    it('should be defined BusinessChatService', () => {
        expect(module.get<BusinessChatService>(BusinessChatService)).toBeDefined();
    });
    it('should be defined B_CHAT_MODULE_PUB_SUB', () => {
        expect(module.get<RedisPubSub>(B_CHAT_MODULE_PUB_SUB)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<BusinessChatModule>(BusinessChatModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
