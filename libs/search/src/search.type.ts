/**
 * @module SearchModule
 */

/** 생성할 인덱스의 커스텀 맵핑 */
export interface SearchCustomMappings {
  properties: Record<string, Record<string, unknown> | undefined | null>;
}
