/**
 * @module UserFollowModule
 */
import graphqlFields from "graphql-fields";
import { BadRequestException, UseGuards } from "@nestjs/common";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import dedent from "dedent";
import { GraphQLResolveInfo } from "graphql";
import { UserFollow, UserFollowList } from "./follow.model";
import { UserFollowService } from "./follow.service";
import { UserInputError } from "apollo-server-fastify";
import { UserFollowLoader } from "./follow.loader";
import { PaginationArgs } from "@yumis-coconudge/common-module";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { User } from "@app/user/user.model";
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";

/**
 * 사용자 팔로우 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => UserFollow)
export class UserFollowResolver {
  constructor(public userFollowService: UserFollowService, public userFollowLoader: UserFollowLoader) { }

  @Query(returns => UserFollowList, {
    description: dedent`
      특정 사용자가 팔로우 중인 사용자 목록을 가져옵니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
    `,
  })
  @UseGuards(JwtGuard)
  async followingUsers(
    @Args("userId", { type: () => ID, description: "사용자 ID" }) userId: string,
    @Args() args: PaginationArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<Partial<UserFollowList>> {
    const fields = graphqlFields(info);
    let result: Partial<UserFollowList> = {
      totalCount: null,
      edges: null,
      pageInfo: null,
    };
    try {
      if ("totalCount" in fields) result.totalCount = await this.userFollowService.countByUserId(userId);

      if ("edges" in fields || "pageInfo" in fields)
        result.edges = await this.userFollowService.getEdgesByUserId(userId, args);

      if ("edges" in fields && "pageInfo" in fields)
        result.pageInfo = await this.userFollowService.getPageInfoByUserId(userId, result.edges, args);

      return result;
    } catch (e) {
      if (e instanceof SyntaxError) throw new UserInputError("잘못된 인자입니다.");
      throw e;
    }
  }

  @Mutation(returns => User, {
    description: dedent`
      나 자신의 사용자로 특정 사용자를 팔로우하거나 언팔로우합니다.

      **에러 코드**
      - \`BAD_USER_INPUT\`: 이미 팔로잉한 사용자입니다.
      - \`BAD_USER_INPUT\`: 팔로잉한 사용자가 아닙니다.
    `,
  })
  @UseGuards(JwtGuard)
  async followUser(
    @Args("isFollowing", { description: "팔로우 여부" }) isFollowing: boolean,
    @Args("userId", { type: () => ID, description: "사용자 ID" }) userId: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<User> {
    try {
      if (isFollowing === true) return this.userFollowService.follow(jwtPayload.id, userId);
      else return this.userFollowService.unfollow(jwtPayload.id, userId);
    } catch (e) {
      if (e instanceof BadRequestException) throw new UserInputError(e.message);
      throw e;
    }
  }

  @ResolveField(returns => User, { description: "사용자" })
  async user(@Parent() parent: UserFollow): Promise<User> {
    return this.userFollowLoader.getDestinationUser(parent.id);
  }
}

@Resolver(of => User)
export class UserFollowUserResolveField {

  constructor(public userFollowLoader: UserFollowLoader) {

  }

  @ResolveField(type => Number, { description: "팔로워 개수" })
  async followerCnt(@Parent() user: User) {
    return await this.userFollowLoader.getFollowerCnt(user.id)
  }

  @ResolveField(type => Number, { description: "팔로잉 개수" })
  async followingCnt(@Parent() user: User) {
    return await this.userFollowLoader.getFollowingCnt(user.id)
  }
}
