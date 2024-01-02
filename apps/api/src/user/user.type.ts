/**
 * @module UserModule
 */

import { UserEntity } from "@app/entity";

/** 사용자 일라스틱 서치 도큐먼트 */
export type UserDocument = Pick<UserEntity, "id" | "idx" | "name" | "nickname">;
