/**
 * 해시태그를 관리하기 위한 모듈입니다.
 *
 * ## 다이어그램
 * ```mermaid
 * classDiagram
 * AuthModule --> HashtagModule : Import
 * UserModule --> HashtagModule : Import
 * SearchModule --> HashtagModule : Import
 * HashtagModule o-- HashtagService : Provide
 * HashtagModule o-- HashtagResolver : Provide
 * HashtagResolver <.. HashtagService : Inject
 * HashtagService <.. EntityManager : Inject
 * HashtagService <.. SearchService : Inject
 * ```
 * @module HashtagModule
 */
import { AuthModule } from "@app/auth";
import { SearchModule, SearchService } from "@app/search";
import { Module, OnModuleInit } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { HASHTAG_ELASTICSEARCH_INDEX_NAME } from "./hashtag.const";
import { HashtagEntity } from "./hashtag.entity";
import { HashtagResolver } from "./hashtag.resolver";
import { HashtagService } from "./hashtag.service";

/**
 * 해시태그 모듈
 * @hidden
 */
@Module({
  imports: [AuthModule, UserModule, SearchModule, TypeOrmModule.forFeature([HashtagEntity])],
  providers: [HashtagResolver, HashtagService],
  exports: [HashtagService],
})
export class HashtagModule implements OnModuleInit {
  #searchService: SearchService;

  constructor(searchService: SearchService) {
    this.#searchService = searchService;
  }

  async onModuleInit(): Promise<void> {
    if ((await this.#searchService.existsIndex(HASHTAG_ELASTICSEARCH_INDEX_NAME)) === true) return;

    const isOk = await this.#searchService.createIndex(HASHTAG_ELASTICSEARCH_INDEX_NAME, {
      properties: {
        id: undefined,
        keyword: { type: "text", analyzer: "edge_ngram_analyzer", fielddata: true },
      },
    });

    if (isOk === false)
      throw new Error(`일라스틱 서치에서 ${HASHTAG_ELASTICSEARCH_INDEX_NAME} 인덱스를 생성하는데 실패하였습니다.`);
  }
}
