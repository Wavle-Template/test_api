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
import { UserSocialModule } from '../../social.module';
import { UserSocialKakaoLoginModule } from '../kakao-login.module';
import { UserSocialKakaoLoginResolver } from '../kakao-login.resolver';
import { UserSocialKakaoLoginService } from '../kakao-login.service';


describe('Kakao-Login-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            UserSocialEntity, UserArchiveEntity, SleeperEntity, UserSuspenedLogEntity
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                UserSocialKakaoLoginModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined UserSocialKakaoLoginService', () => {
        expect(module.get<UserSocialKakaoLoginService>(UserSocialKakaoLoginService)).toBeDefined();
    });

    it('should be defined UserSocialModule', () => {
        expect(module.get<UserSocialModule>(UserSocialModule)).toBeDefined();
    });

    it('should be defined UserSocialKakaoLoginResolver', () => {
        expect(module.get<UserSocialKakaoLoginResolver>(UserSocialKakaoLoginResolver)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<UserSocialKakaoLoginModule>(UserSocialKakaoLoginModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
