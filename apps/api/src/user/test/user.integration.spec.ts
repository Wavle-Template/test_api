import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { UserModule } from '../user.module';
import { UserAuthService } from '@app/auth/role.auth.service';
import { UserEntityModule, FileEntityModule } from '@app/entity';
import { UserArchiveService } from '../archive/user-archive.service';
import { SleeperService } from '../sleeper/sleeper.service';
import { UserSuspendedLogService } from '../suspended-log/suspended-log.service';
import { UserAdminResolver } from '../user.admin.resolver';
import { UserLoader } from '../user.loader';
import { UserResolver } from '../user.resolver';
import { UserScheduleService } from '../user.schedule.service';
import { UserService } from '../user.service';


describe('User-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            UserArchiveEntity, SleeperEntity, UserSuspenedLogEntity
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                UserModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined UserService', () => {
        expect(module.get<UserService>(UserService)).toBeDefined();
    });

    it('should be defined UserEntityModule', () => {
        expect(module.get<UserEntityModule>(UserEntityModule)).toBeDefined();
    });

    it('should be defined FileEntityModule', () => {
        expect(module.get<FileEntityModule>(FileEntityModule)).toBeDefined();
    });

    it('should be defined UserAuthService', () => {
        expect(module.get<UserAuthService>(UserAuthService)).toBeDefined();
    });

    it('should be defined UserLoader', () => {
        expect(module.get<UserLoader>(UserLoader)).toBeDefined();
    });

    it('should be defined UserResolver', () => {
        expect(module.get<UserResolver>(UserResolver)).toBeDefined();
    });

    it('should be defined UserAdminResolver', () => {
        expect(module.get<UserAdminResolver>(UserAdminResolver)).toBeDefined();
    });

    it('should be defined UserSuspendedLogService', () => {
        expect(module.get<UserSuspendedLogService>(UserSuspendedLogService)).toBeDefined();
    });

    it('should be defined UserScheduleService', () => {
        expect(module.get<UserScheduleService>(UserScheduleService)).toBeDefined();
    });

    it('should be defined SleeperService', () => {
        expect(module.get<SleeperService>(SleeperService)).toBeDefined();
    });

    it('should be defined UserArchiveService', () => {
        expect(module.get<UserArchiveService>(UserArchiveService)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<UserModule>(UserModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
