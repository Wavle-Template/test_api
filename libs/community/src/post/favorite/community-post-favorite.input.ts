import { Field, ID, InputType } from "@nestjs/graphql";

@InputType({ description: "커뮤니티 게시글 즐겨찾기 추가" })
export class CommunityPostFavoriteCreateInput {
    @Field(type => ID, { description: "사용자 uuid" })
    user__id: string;

    @Field(type => ID, { description: "커뮤니티 게시글 uuid" })
    post__id: string;
}
