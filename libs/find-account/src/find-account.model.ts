import { UserSocialType } from "@app/entity/user/social/social.enum";
import { Field, ObjectType } from "@nestjs/graphql";

@ObjectType({ description: "아이디 찾기를 통해 찾은 정보" })
export class FinedAccount {
    @Field(_ => String, { description: "로그인 ID" })
    loginId: string;

    @Field(_ => [UserSocialType], { description: "연동된 소셜 계정 리스트, 없을시 undefined", nullable: true })
    socialTypes?: UserSocialType[];
}