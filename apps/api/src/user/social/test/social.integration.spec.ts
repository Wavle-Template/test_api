import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { UserSocialEntity } from '@app/entity';
import { UserSocialModule } from '../social.module';
import { LastLoginService } from '@app/auth/last.login.service';
import { SocialResolver } from '../social.resolver';
import { UserSocialService } from '../social.service';


describe('Social-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            UserSocialEntity, UserArchiveEntity,SleeperEntity ,UserSuspenedLogEntity
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                UserSocialModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined UserSocialService', () => {
        expect(module.get<UserSocialService>(UserSocialService)).toBeDefined();
    });

    it('should be defined LastLoginService', () => {
        expect(module.get<LastLoginService>(LastLoginService)).toBeDefined();
    });

    it('should be defined SocialResolver', () => {
        expect(module.get<SocialResolver>(SocialResolver)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<UserSocialModule>(UserSocialModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
