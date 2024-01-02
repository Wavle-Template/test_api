import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { ServiceManageModule, ServiceManageService } from '@app/service-manage';
import { ServiceManageEntity } from '@app/service-manage/service-manage.entity';
import { getMockDbConnection } from '@test/utils/mock-db';
import { ServiceManageController } from '@app/service-manage/service-manage.controller';

describe('ServiceManageIntegration-Test', () => {
    let service: ServiceManageService;
    let module: TestingModule
    let connection;

    beforeAll(async () => {

        connection = await getMockDbConnection([
            ServiceManageEntity
        ])

        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                ServiceManageModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

        service = module.get<ServiceManageService>(ServiceManageService);


    });

    it('should be defined service', () => {
        expect(service).toBeDefined();
    });


    it('should be defined module', () => {
        expect(module.get<ServiceManageModule>(ServiceManageModule)).toBeDefined();
    });

    it('should be defined controller', () => {
        expect(module.get<ServiceManageController>(ServiceManageController)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
