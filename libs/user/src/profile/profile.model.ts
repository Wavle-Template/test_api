/**
 * @module UserModule
 */
import { Field, ObjectType } from "@nestjs/graphql";

/**
 * 사용자 프로필
 * @category GraphQL Object Type
 */
@ObjectType({ description: "사용자 프로필" })
export class UserProfile {
  @Field(returns => String, { nullable: true, description: "프로필 설명" })
  description?: string;

  @Field(returns => String, { nullable: true, description: "홈페이지 등 링크" })
  url?: string;
}
