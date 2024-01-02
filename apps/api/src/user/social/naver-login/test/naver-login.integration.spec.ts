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
import { UserSocialNaverLoginModule } from '../naver-login.module';
import { UserSocialModule } from '../../social.module';
import { UserSocialNaverLoginResolver } from '../naver-login.resolver';
import { UserSocialNaverLoginService } from '../naver-login.service';


describe('Naver-Login-Integration-Test', () => {
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
                UserSocialNaverLoginModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined UserSocialNaverLoginService', () => {
        expect(module.get<UserSocialNaverLoginService>(UserSocialNaverLoginService)).toBeDefined();
    });

    it('should be defined UserSocialModule', () => {
        expect(module.get<UserSocialModule>(UserSocialModule)).toBeDefined();
    });

    it('should be defined UserSocialNaverLoginResolver', () => {
        expect(module.get<UserSocialNaverLoginResolver>(UserSocialNaverLoginResolver)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<UserSocialNaverLoginModule>(UserSocialNaverLoginModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
