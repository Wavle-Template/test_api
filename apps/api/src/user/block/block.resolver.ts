/**
 * @module UserBlockModule
 */
import graphqlFields from "graphql-fields";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";
import { UserBlock, UserBlockList } from "./block.model";
import { UserBlockService } from "./block.service";
import { UserInputError } from "apollo-server-fastify";
import { UserBlockLoader } from "./block.loader";
import dedent from "dedent";
import { PaginationArgs } from "@yumis-coconudge/common-module";
import { Edge } from "@yumis-coconudge/typeorm-helper";
import { UserBlockEntity } from "@app/entity";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { User } from "@app/user/user.model";

/**
 * 사용자 차단 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => UserBlock)
export class UserBlockResolver {
  constructor(public userBlockService: UserBlockService, public userBlockLoader: UserBlockLoader) {}

  @Query(returns => UserBlockList, {
    description: dedent`
      내가 차단한 사용자 목록을 조회합니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async myBlockUsers(
    @Args() args: PaginationArgs,
    @Info() info: GraphQLResolveInfo,
    @CurrentJwtPayload() jwtPayload?: AuthTokenPayload,
  ): Promise<Partial<UserBlockList>> {
    const fields = graphqlFields(info);
    let result: Partial<UserBlockList> = {
      totalCount: null,
      edges: null,
      pageInfo: null,
    };
    try {
      if ("totalCount" in fields) result.totalCount = await this.userBlockService.countByUserId(jwtPayload.id);

      if ("edges" in fields || "pageInfo" in fields)
        result.edges = (await this.userBlockService.getEdgesByUserId(jwtPayload.id, args)) as Edge<UserBlock>[];

      if ("edges" in fields && "pageInfo" in fields)
        result.pageInfo = await this.userBlockService.getPageInfoByUserId(
          jwtPayload.id,
          result.edges as Edge<UserBlockEntity>[],
          args,
        );

      return result;
    } catch (e) {
      if (e instanceof SyntaxError) throw new UserInputError("잘못된 인자입니다.");
      throw e;
    }
  }

  @Mutation(returns => User, {
    description: dedent`
      사용자를 차단하거나 해제합니다.
    `,
  })
  @UseGuards(JwtGuard)
  async blockUser(
    @Args("isBlocking") isBlocking: boolean,
    @Args("userId", { type: () => ID }) userId: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ) {
    if (isBlocking === true) return this.userBlockService.block(jwtPayload.id, userId);
    else return this.userBlockService.unblock(jwtPayload.id, userId);
  }

  @ResolveField(returns => User)
  async user(@Parent() block: UserBlock) {
    return this.userBlockLoader.getUser(block.id);
  }
}
