import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { WavleMailerModule } from '../src/mailer.module';
import { MailerModule } from '@nestjs-modules/mailer';
import { WavleMailerService } from '../src/mailer.service';

describe('Mailer-Integration-Test', () => {
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
                WavleMailerModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined WavleMailerService', () => {
        expect(module.get<WavleMailerService>(WavleMailerService)).toBeDefined();
    });

    it('should be defined MailerModule', () => {
        expect(module.get<MailerModule>(MailerModule)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<WavleMailerModule>(WavleMailerModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
