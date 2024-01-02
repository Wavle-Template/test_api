/**
 * @module HashtagModule
 */
import type { HashtagEntity } from "./hashtag.entity";

/** 해시태그 일라스틱서치 도큐먼트 */
export type HashtagDocument = Pick<HashtagEntity, "id" | "keyword">;
