/**
 * @module UserModule
 */
import { Field, InputType } from "@nestjs/graphql";

@InputType({description:"프로필 수정"})
export class UserProfileUpdateInput {
    @Field(returns => String, { nullable: true, description: "프로필 설명" })
    description?: string;

    @Field(returns => String, { nullable: true, description: "홈페이지 등 링크" })
    url?: string;
}