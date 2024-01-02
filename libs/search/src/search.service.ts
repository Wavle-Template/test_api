/**
 * @module SearchModule
 */
import {
  DeleteResponse,
  GetResponse,
  IndexResponse,
  SearchResponse,
  UpdateResponse,
} from "@elastic/elasticsearch/api/types";
import { Injectable, Logger, OnApplicationBootstrap } from "@nestjs/common";
import { ElasticsearchService } from "@nestjs/elasticsearch";
import { SearchCustomMappings } from "./search.type";

/**
 * 일라스틱서치를 간편하게 검색하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class SearchService implements OnApplicationBootstrap {
  /** 일라스틱서치 기본 세팅 */
  #settings: Record<string, unknown>;
  /** 일라스틱서치 서비스 */
  #esService: ElasticsearchService;
  /** 로거 */
  #logger: Logger;

  /**
   * @param esService 일라스틱서치 서비스
   * @param logger 로거
   */
  constructor(esService: ElasticsearchService, logger: Logger) {
    this.#esService = esService;
    this.#logger = logger;

    this.#settings = {
      analysis: {
        tokenizer: {
          edge_ngram_tokenizer: {
            min_gram: "1",
            max_gram: "20",
            type: "edge_ngram",
            token_chars: ["letter", "digit"],
          },
        },
        analyzer: {
          edge_ngram_analyzer: {
            type: "custom",
            tokenizer: "edge_ngram_tokenizer",
          },
        },
      },
    };
  }

  async onApplicationBootstrap(): Promise<void> {
    try {
      await new Promise<void>((resolve, reject) =>
        this.#esService.ping({}, error => {
          if (error != undefined) reject(error);
          else resolve();
        }),
      );
    } catch (e) {
      this.#logger.error("Elasticsearch 서버 연결을 실패하였습니다.");
    }
  }

  /**
   * 인덱스 존재 여부를 확인합니다.
   * @param index 확인할 인덱스 이름
   * @returns 인덱스 존재 여부
   */
  async existsIndex(index: string): Promise<boolean> {
    const response = await this.#esService.indices.exists({ index: index });
    return response.statusCode === 200;
  }

  /**
   * 인덱스를 생성합니다.
   * @param index 생성할 인덱스 이름
   * @param customMappings 인덱스의 커스텀 맵핑 정보
   * @returns 인덱스 생성 여부
   */
  async createIndex(index: string, customMappings: SearchCustomMappings): Promise<boolean> {
    const defaultProperty = { type: "text", analyzer: "edge_ngram_analyzer", fielddata: true };

    let properties = {};
    for (const field in customMappings.properties) {
      const property = customMappings.properties[field];
      if (field === "id") {
        properties = {
          ...properties,
          id: { type: "text" },
        };
      } else if (property == null) {
        properties = {
          ...properties,
          [field]: defaultProperty,
        };
      } else {
        properties = {
          ...properties,
          [field]: property,
        };
      }
    }

    const response = await this.#esService.indices.create({
      index: index,
      body: {
        mappings: {
          ...customMappings,
          properties: properties,
        },
        settings: this.#settings,
      },
    });

    return response.statusCode === 200;
  }

  /**
   * 인덱스를 삭제합니다.
   * @param index 삭제할 인덱스 이름
   * @returns 인덱스 삭제 여부
   */
  async deleteIndex(index: string): Promise<boolean> {
    const response = await this.#esService.indices.delete({ index: index });
    return response.statusCode === 200;
  }

  /**
   * 도큐먼트 존재 여부를 확인합니다.
   * @param index 확인할 도큐먼트의 인덱스 이름
   * @param id 도큐먼트 ID
   * @returns 도큐먼트 존재 여부
   */
  async existsDocument(index: string, id: string): Promise<boolean> {
    const result = await this.#esService.exists({ index: index, id: id });
    return result.body;
  }

  /**
   * 특정 도큐먼트를 조회합니다.
   * @template TSource 도큐먼트 타입
   * @param index 조회할 도큐먼트의 인덱스 이름
   * @param id 조회할 도큐먼트 ID
   * @returns 도큐먼트 데이터
   */
  async get<TSource>(index: string, id: string): Promise<TSource> {
    const response = await this.#esService.get<GetResponse<TSource>>({
      index: index,
      id: id,
    });

    return response.body._source;
  }

  /**
   * 도큐먼트를 저장합니다.
   * @template TSource 도큐먼트 타입
   * @param index 저장할 도큐먼트의 인덱스 이름
   * @param data 저장할 도큐먼트 데이터
   * @returns 저장한 도큐먼트 데이터
   */
  async set<TSource extends { id: string }>(index: string, data: TSource): Promise<TSource> {
    const { id, ...rest } = data;
    if (process.env.NODE_ENV === "test") return;
    if ((await this.existsDocument(index, data.id)) === true) {
      const response = await this.#esService.update<UpdateResponse<TSource>>({
        index: index,
        id: id,
        body: {
          doc: {
            ...rest,
          },
        },
      });

      if (response.body.result === "updated" || response.body.result === "noop") {
        const updatedResult = await this.#esService.get<GetResponse<TSource>>({
          index: index,
          id: data.id,
        });
        return updatedResult.body._source;
      }

      throw new Error(response.body.result);
    } else {
      const response = await this.#esService.index<IndexResponse, TSource>({
        index: index,
        id: data.id,
        refresh: true,
        body: data,
      });

      if (response.body.result === "created") {
        return data;
      }

      throw new Error(response.body.result);
    }
  }

  /**
   * 도큐먼트를 일괄 처리합니다.
   * @template TSource 도큐먼트 타입
   * @param index 일괄 처리할 도큐먼트가 있는 인덱스 이름
   * @param datas 일괄 처리할 데이터 (bulkType을 포함시켜야합니다.)
   * @returns 처리된 도큐먼트 데이터
   */
  async bulk<TSource extends { id: string }>(
    index: string,
    datas: (TSource & { bulkType: "create" | "update" | "delete" | "index" })[],
  ): Promise<TSource[]> {
    if (process.env.NODE_ENV === "test") return;
    if (datas.length === 0) return datas;

    const response = await this.#esService.bulk({
      refresh: true,
      body: datas.reduce((acc, data) => {
        let operation: Record<string, unknown>;
        let source: Record<string, unknown>;
        switch (data.bulkType) {
          case "index":
            operation = { index: { _index: index, _id: data.id } };
            source = data;
            break;
          case "update":
            operation = { update: { _index: index, _id: data.id } };
            source = { doc: data };
            break;
          case "delete":
            operation = { delete: { _index: index, _id: data.id } };
            break;
          case "create":
          default:
            operation = { create: { _index: index, _id: data.id } };
            source = data;
        }

        if (data.bulkType === "delete") return [...acc, operation];
        return [...acc, operation, source];
      }, []),
    });

    if (response.statusCode === 200) return datas;
    throw response.body;
  }

  /**
   * 특정 도큐먼트를 삭제합니다.
   * @param index 삭제할 도큐먼트의 인덱스 이름
   * @param id 삭제할 도큐먼트 ID
   * @returns 삭제 성공 여부
   */
  async delete(index: string, id: string): Promise<boolean> {
    const response = await this.#esService.delete<DeleteResponse>({
      index: index,
      id: id,
      refresh: true,
    });
    if (response.body.result !== "deleted") throw new Error(response.body.result);

    return true;
  }

  /**
   * 일라스틱서치 쿼리로 검색합니다.
   * @param index 검색할 인덱스 이름
   * @param body 검색할 내용
   * @param size 검색 결과 최대 개수
   * @returns 검색 결과
   */
  async search<TSource extends { id: string }, TBody>(index: string, body: TBody, size = 5): Promise<TSource[]> {
    const response = await this.#esService.search<SearchResponse<TSource>>({
      index: index,
      size: size,
      sort: ["_score"],
      body: body,
    });

    return response.body.hits.hits.map(hit => hit._source);
  }
}
