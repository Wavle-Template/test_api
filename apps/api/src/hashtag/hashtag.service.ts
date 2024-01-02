/**
 * @module HashtagModule
 */
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { EntityManager, In } from "typeorm";
import { HASHTAG_ELASTICSEARCH_INDEX_NAME } from "./hashtag.const";
import { HashtagEntity } from "./hashtag.entity";
import { HashtagSource } from "./hashtag.model";
import { DeepPartial } from "ts-essentials";
import { HashtagDocument } from "./hashtag.type";
import { SearchService } from "@app/search";

/**
 * 해시태그를 관리 및 검색하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class HashtagService extends CRUDService<HashtagEntity> {
  /** 서치 서비스 */
  #searchService: SearchService;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   * @param searchService 서치 서비스
   */
  constructor(@InjectEntityManager() entityManager: EntityManager, searchService: SearchService) {
    super(entityManager, HashtagEntity);
    this.#searchService = searchService;
  }

  /**
   * 해시태그를 검색합니다.
   * @param keyword 검색할 키워드
   * @param size 검색 결과 수
   * @returns 검색 결과
   */
  async search(keyword: string, size = 5): Promise<HashtagSource[]> {
    return this.#searchService.search(HASHTAG_ELASTICSEARCH_INDEX_NAME, {
      searchProperty: "keyword",
      keyword: keyword,
    });
  }

  /**
   * 특정 키워드의 해시태그를 조회합니다.
   * @param keyword 키워드
   * @returns 해시태그 엔티티
   */
  async findOneByKeyword(keyword: string): Promise<HashtagEntity> {
    return this.repository.findOne({ keyword: keyword });
  }

  async createOne(data: DeepPartial<HashtagEntity>, transactionManager?: EntityManager): Promise<HashtagEntity> {
    return this.useTransaction(async manager => {
      let hashtag = manager.create(HashtagEntity, data);
      hashtag = await manager.save(hashtag);

      await this.#searchService.set(HASHTAG_ELASTICSEARCH_INDEX_NAME, {
        id: hashtag.id,
        keyword: hashtag.keyword,
      });

      return await manager.findOne(HashtagEntity, data.id);
    }, transactionManager);
  }

  async createMany(datas: DeepPartial<HashtagEntity>[], transactionManager?: EntityManager): Promise<HashtagEntity[]> {
    return await this.useTransaction(async manager => {
      let hashtags = datas.map(data => manager.create(HashtagEntity, data));
      hashtags = await manager.save(hashtags);

      await this.#searchService.bulk<HashtagDocument>(
        HASHTAG_ELASTICSEARCH_INDEX_NAME,
        hashtags.map(hashtag => ({
          bulkType: "create",
          id: hashtag.id,
          keyword: hashtag.keyword,
        })),
      );

      return await manager.find(HashtagEntity, { where: { id: In(hashtags.map(hashtag => hashtag.id)) } });
    }, transactionManager);
  }

  async deleteOne(id: string, transactionManager?: EntityManager): Promise<HashtagEntity> {
    return this.useTransaction(async manager => {
      let hashtag = await manager.findOneOrFail(HashtagEntity, id);
      hashtag = await manager.remove(hashtag);
      await this.#searchService.delete(HASHTAG_ELASTICSEARCH_INDEX_NAME, id);

      return hashtag;
    }, transactionManager);
  }

  async deleteMany(ids: string[], transactionManager?: EntityManager): Promise<HashtagEntity[]> {
    return this.useTransaction(async manager => {
      let hashtags = await manager.find(HashtagEntity, { where: { id: In(ids) } });
      hashtags = await manager.remove(hashtags);
      await this.#searchService.bulk<Pick<HashtagDocument, "id">>(
        HASHTAG_ELASTICSEARCH_INDEX_NAME,
        ids.map(id => ({
          bulkType: "delete",
          id: id,
        })),
      );

      return hashtags;
    }, transactionManager);
  }
}
