import { ConfigModule } from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import SettingConfig from '@app/setting'
import { getMockDbConnection } from '@test/utils/mock-db';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchModule, SearchService } from '@app/search';

describe('Search-Integration-Test', () => {
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
                SearchModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();

    });

    it('should be defined SearchService', () => {
        expect(module.get<SearchService>(SearchService)).toBeDefined();
    });

    it('should be defined ElasticsearchModule', () => {
        expect(module.get<ElasticsearchModule>(ElasticsearchModule)).toBeDefined();
    });

    it('should be defined module', () => {
        expect(module.get<SearchModule>(SearchModule)).toBeDefined();
    });

    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })


});
