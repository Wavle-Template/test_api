import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { RedisPubSub } from 'graphql-redis-subscriptions';
import { ChatChannelEntity, ChatChannelParticipantEntity, ChatMessageEntity } from '@app/common-chat-res';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { ChatModule, CHAT_MODULE_PUB_SUB } from '@app/chat';
import { ChatChannelService, ChatChannelLoader, ChatChannelResolver, ChatChannelResolveFields } from '@app/chat/chat-channel';
import { ChatChannelParticipantLoader, ChatChannelParticipantResolver } from '@app/chat/chat-channel/chat-channel-participant';
import { ChatMessageService, ChatMessageLoader, ChatMessageResolver } from '@app/chat/chat-message';
import { ChatReportEntity } from '@app/chat/report/chat-report.entity';

describe('Chat-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            ChatReportEntity,
            ChatChannelEntity, ChatChannelParticipantEntity, ChatMessageEntity,
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
                ChatModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined ChatChannelService', () => {
        expect(module.get<ChatChannelService>(ChatChannelService)).toBeDefined();
    });

    it('should be defined ChatChannelLoader', () => {
        expect(module.get<ChatChannelLoader>(ChatChannelLoader)).toBeDefined();
    });
    it('should be defined ChatChannelResolver', () => {
        expect(module.get<ChatChannelResolver>(ChatChannelResolver)).toBeDefined();
    });
    it('should be defined ChatChannelResolveFields', () => {
        expect(module.get<ChatChannelResolveFields>(ChatChannelResolveFields)).toBeDefined();
    });
    it('should be defined ChatChannelParticipantLoader', () => {
        expect(module.get<ChatChannelParticipantLoader>(ChatChannelParticipantLoader)).toBeDefined();
    });
    it('should be defined ChatChannelParticipantResolver', () => {
        expect(module.get<ChatChannelParticipantResolver>(ChatChannelParticipantResolver)).toBeDefined();
    });
    it('should be defined ChatMessageService', () => {
        expect(module.get<ChatMessageService>(ChatMessageService)).toBeDefined();
    });
    it('should be defined ChatMessageLoader', () => {
        expect(module.get<ChatMessageLoader>(ChatMessageLoader)).toBeDefined();
    });
    it('should be defined ChatMessageResolver', () => {
        expect(module.get<ChatMessageResolver>(ChatMessageResolver)).toBeDefined();
    });
    it('should be defined CHAT_MODULE_PUB_SUB', () => {
        expect(module.get<RedisPubSub>(CHAT_MODULE_PUB_SUB)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<ChatModule>(ChatModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
