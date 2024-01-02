/**
 * 일라스틱 서치를 이용해서 검색하는 기능을 제공합니다.
 *
 * ### 다이어그램
 * ```mermaid
 * classDiagram
 * ElasticsearchModule --> SearchModule : Import
 * SearchModule o-- SearchService : Provide
 * SearchModule o-- Logger : Provide
 * SearchService <.. ElasticsearchService : Inject
 * SearchService <.. Logger : Inject
 * ```
 * @module SearchModule
 */
import { Logger, Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ElasticsearchModule } from "@nestjs/elasticsearch";
import { SearchService } from "./search.service";

/**
 * 검색 모듈
 * @hidden
 */
@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const url = configService.get<string>("ELASTICSEARCH_URL");
        const username = configService.get<string>("ELASTICSEARCH_USERNAME");
        const password = configService.get<string>("ELASTICSEARCH_PASSWORD");

        if (url === undefined) throw new Error("ELASTICSEARCH_URL이 없습니다.");

        if (username != null && password != null)
          return {
            node: url,
            username: username,
            password: password,
          };

        return {
          node: url,
        };
      },
    }),
  ],
  providers: [SearchService, { provide: Logger, useValue: new Logger(SearchModule.name) }],
  exports: [SearchService],
})
export class SearchModule {}
