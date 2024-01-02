import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { UserFCMTokenEntity } from '@app/entity';
import { UserFCMTokenModule } from '../fcm-token.module';
import { UserFCMTokenLoader } from '../fcm-token.loader';
import { UserFCMTokenResolver } from '../fcm-token.resolver';
import { UserFCMTokenService } from '../fcm-token.service';


describe('Block-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            UserFCMTokenEntity,
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                UserFCMTokenModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined UserFCMTokenService', () => {
        expect(module.get<UserFCMTokenService>(UserFCMTokenService)).toBeDefined();
    });

    it('should be defined UserFCMTokenResolver', () => {
        expect(module.get<UserFCMTokenResolver>(UserFCMTokenResolver)).toBeDefined();
    });

    it('should be defined UserFCMTokenLoader', () => {
        expect(module.get<UserFCMTokenLoader>(UserFCMTokenLoader)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<UserFCMTokenModule>(UserFCMTokenModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
