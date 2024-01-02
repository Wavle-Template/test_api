import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { AdminPostEntity } from '../admin-post.entity';
import { AdminPostLoader } from '../admin-post.loader';
import { AdminPostResolver } from '../admin-post.resolver';
import { AdminPostService } from '../admin-post.service';
import { AdminPostModule } from '../admin-post.module';
import { AdminPostCategoryResolver } from '../category/category.resolver';
import { AdminPostCategoryService } from '../category/category.service';
import { AdminPostCategoryEntity } from '../category/category.entity';
import { UserSuspenedLogEntity } from '@app/entity/user/log/suspended.entity';
import { SleeperEntity } from '@app/entity/user/sleeper/sleeper.entity';
import { UserArchiveEntity } from '@app/entity/user/archive/user-archive.entity';

describe('Admin-post-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([AdminPostEntity, AdminPostCategoryEntity, UserSuspenedLogEntity, SleeperEntity, UserArchiveEntity])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                AdminPostModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined AdminPostService', () => {
        expect(module.get<AdminPostService>(AdminPostService)).toBeDefined();
    });

    it('should be defined AdminPostCategoryService', () => {
        expect(module.get<AdminPostCategoryService>(AdminPostCategoryService)).toBeDefined();
    });

    it('should be defined AdminPostLoader', () => {
        expect(module.get<AdminPostLoader>(AdminPostLoader)).toBeDefined();
    });

    it('should be defined AdminPostResolver', () => {
        expect(module.get<AdminPostResolver>(AdminPostResolver)).toBeDefined();
    });

    it('should be defined AdminPostCategoryResolver', () => {
        expect(module.get<AdminPostCategoryResolver>(AdminPostCategoryResolver)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<AdminPostModule>(AdminPostModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
