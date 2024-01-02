import { User } from "@app/user/user.model";
import { Field, ID, InputType, Int, ObjectType, OmitType } from "@nestjs/graphql";
import { DefaultFilterInput, DefaultModel, DefaultSortInput, IDFilterInput, Pagination, SortInput, StringFilterInput } from "@yumis-coconudge/common-module";
@ObjectType({ description: "커뮤니티 게시물 댓글" })
export class CommunityPostReply extends DefaultModel {
  @Field({ description: "댓글 내용" })
  content: string;

  @Field(type => User, { description: "작성자" })
  author: User;

  @Field(type => Int, { description: "좋아요 수" })
  likeCount: number;

  @Field(type => [User], { description: "사용자 태그", nullable: true })
  usertags?: User[];
}

@ObjectType({ description: "커뮤니티 게시물 댓글 목록" })
export class CommunityPostReplyList extends Pagination(CommunityPostReply) {}

