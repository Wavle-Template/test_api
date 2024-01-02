import { FileEntity, UserBlockEntity, UserEntity, UserFCMTokenEntity, UserFollowEntity, UserSocialEntity } from '@app/entity';
import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { BaseUserLoader } from '../src/user.loader';
import { BaseUserService } from '../src/user.service';
import SettingConfig from '@app/setting'
import { BaseUserModule } from '../src/user.module';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { getMockDbConnection } from '@test/utils/mock-db';

describe('BaseUserIntegration-Test', () => {
    let service: BaseUserService;
    let loader: BaseUserLoader;
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            UserEntity, UserBlockEntity, UserFCMTokenEntity,
            UserFollowEntity,
            UserSocialEntity,
            UserSuspenedLogEntity,
            SleeperEntity,
            UserArchiveEntity,
            FileEntity
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                BaseUserModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

        service = module.get<BaseUserService>(BaseUserService);
        loader = module.get<BaseUserLoader>(BaseUserLoader)

    });

    it('should be defined service', () => {
        expect(service).toBeDefined();
    });

    it('should be defined loader', () => {
        expect(loader).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<BaseUserModule>(BaseUserModule)).toBeDefined();
    });


    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
