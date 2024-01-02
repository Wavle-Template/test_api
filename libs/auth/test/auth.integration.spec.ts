import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { AuthModule, AuthService } from '@app/auth';
import { AuthTokenService } from '@app/auth/token/token.service';
import { AuthResolver } from '@app/auth/auth.resolver';
import { LastLoginService } from '@app/auth/last.login.service';
import { AuthController } from '@app/auth/auth.controller';

describe('AuthIntegration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                AuthModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined auth-service', () => {
        expect(module.get<AuthService>(AuthService)).toBeDefined();
    });

    it('should be defined auth-token-service', () => {
        expect(module.get<AuthTokenService>(AuthTokenService)).toBeDefined();
    });

    it('should be defined resolver', () => {
        expect(module.get<AuthResolver>(AuthResolver)).toBeDefined();
    });

    it('should be defined last-login-service', () => {
        expect(module.get<LastLoginService>(LastLoginService)).toBeDefined();
    });

    it('should be defined controller', () => {
        expect(module.get<AuthController>(AuthController)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<AuthModule>(AuthModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
