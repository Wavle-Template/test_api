import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { PhoneAuthBasicModule, PhoneAuthService } from '../src';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { PHONE_AUTH_REDIST } from '@app/phone-auth/phone-auth.const';
import { Redis } from 'ioredis';

describe('Phone-Auth-Basic-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
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
                PhoneAuthBasicModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined PhoneAuthService', () => {
        expect(module.get<PhoneAuthService>(PhoneAuthService)).toBeDefined();
    });

    it('should be defined PHONE_AUTH_REDIST', () => {
        expect(module.get<Redis>(PHONE_AUTH_REDIST)).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<PhoneAuthBasicModule>(PhoneAuthBasicModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
