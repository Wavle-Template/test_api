import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { ToastModule, ToastSmsService } from '@app/toast';

describe('Toast-Integration-Test', () => {
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        // connection = await getMockDbConnection([
        // ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                // TypeOrmModule.forRoot(),
                ToastModule
            ],
        })
        // .overrideProvider(Connection)
            // .useValue(connection)
            .compile();

    });

    it('should be defined ToastSmsService', () => {
        expect(module.get<ToastSmsService>(ToastSmsService)).toBeDefined();
    });

    


    it('should be defined module', () => {
        expect(module.get<ToastModule>(ToastModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
