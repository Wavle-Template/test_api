import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { FindAccountService } from '@app/find-account';
import { FindPassByEmailModule } from '@app/find-account/business/email/find-account-email.module';
import { NotificationEntity } from '@app/entity/notification/notification.entity';
import { NotificationReadEntity } from '@app/entity/notification/read/read.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { Redis } from 'ioredis';
import { FIND_EMAIL_AUTH_REDIST } from '@app/find-account/business/email/find-account-email.const';
import { FindPassByEmailResolver } from '@app/find-account/business/email/find-account-email.resolver';
import { FindAccountEmailService } from '@app/find-account/business/email/find-account-email.service';
import { WavleMailerModule } from '@app/mailer';

describe('Find-Account-Email-Integration-Test', () => {
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
                FindPassByEmailModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined FindAccountService', () => {
        expect(module.get<FindAccountService>(FindAccountService)).toBeDefined();
    });

    it('should be defined WavleMailerModule', () => {
        expect(module.get<WavleMailerModule>(WavleMailerModule)).toBeDefined();
    });

    it('should be defined FindPassByEmailResolver', () => {
        expect(module.get<FindPassByEmailResolver>(FindPassByEmailResolver)).toBeDefined();
    });

    it('should be defined FindAccountEmailService', () => {
        expect(module.get<FindAccountEmailService>(FindAccountEmailService)).toBeDefined();
    });

    it('should be defined FIND_EMAIL_AUTH_REDIST', () => {
        expect(module.get<Redis>(FIND_EMAIL_AUTH_REDIST)).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<FindPassByEmailModule>(FindPassByEmailModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
