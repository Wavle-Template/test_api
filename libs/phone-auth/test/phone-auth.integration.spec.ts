import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { PhoneAuthModule } from '../src';
import { PhoneAuthResolver } from '@app/phone-auth/phone-auth.resolver';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';

describe('Phone-Auth-Integration-Test', () => {
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
                PhoneAuthModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined PhoneAuthResolver', () => {
        expect(module.get<PhoneAuthResolver>(PhoneAuthResolver)).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<PhoneAuthModule>(PhoneAuthModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
