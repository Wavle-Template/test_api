import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { UserBlockEntity } from '@app/entity';
import { UserBlockModule } from '../block.module';
import { UserBlockService } from '../block.service';
import { UserBlockResolver } from '../block.resolver';
import { UserBlockLoader } from '../block.loader';


describe('Block-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            UserBlockEntity,
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                UserBlockModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined UserBlockService', () => {
        expect(module.get<UserBlockService>(UserBlockService)).toBeDefined();
    });

    it('should be defined UserBlockResolver', () => {
        expect(module.get<UserBlockResolver>(UserBlockResolver)).toBeDefined();
    });

    it('should be defined UserBlockLoader', () => {
        expect(module.get<UserBlockLoader>(UserBlockLoader)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<UserBlockModule>(UserBlockModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
