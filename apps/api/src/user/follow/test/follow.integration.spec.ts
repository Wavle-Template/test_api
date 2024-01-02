import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { UserFollowEntity } from '@app/entity';
import { UserFollowLoader } from '../follow.loader';
import { UserFollowModule } from '../follow.module';
import { UserFollowResolver, UserFollowUserResolveField } from '../follow.resolver';
import { UserFollowService } from '../follow.service';


describe('Block-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            UserFollowEntity,
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                UserFollowModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined UserFollowService', () => {
        expect(module.get<UserFollowService>(UserFollowService)).toBeDefined();
    });

    it('should be defined UserFollowResolver', () => {
        expect(module.get<UserFollowResolver>(UserFollowResolver)).toBeDefined();
    });

    it('should be defined UserFollowUserResolveField', () => {
        expect(module.get<UserFollowUserResolveField>(UserFollowUserResolveField)).toBeDefined();
    });

    it('should be defined UserFollowLoader', () => {
        expect(module.get<UserFollowLoader>(UserFollowLoader)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<UserFollowModule>(UserFollowModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
