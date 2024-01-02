import { Test, TestingModule } from '@nestjs/testing';
import { IntrospectionField } from 'graphql';
import { SchemaParse } from './schema-parse';

describe('Query 호출 테스트', () => {
    // const queryCnt = global.QueryCnt;
    let schemaService: SchemaParse;
    let queries: readonly IntrospectionField[] = JSON.parse(process.env.queries)
    // let queriesData: readonly IntrospectionField[];
    beforeAll(async () => {
        schemaService = new SchemaParse();
        await schemaService.init();
        // queries = schemaService.getQueries();
    });

    queries.forEach((item, index) => {

        test(`${item.name} 호출 테스트`, async () => {

            const response= await schemaService.requestQuery(item);
            expect(response.statusCode).toBe(200);
        })
    })

});
