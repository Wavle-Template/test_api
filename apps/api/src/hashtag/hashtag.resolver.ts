/**
 * @module HashtagModule
 */
import { UseGuards } from "@nestjs/common";
import { Args, ID, Info, Int, Mutation, Query, Resolver } from "@nestjs/graphql";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import dedent from "dedent";
import { GraphQLResolveInfo } from "graphql";
import * as graphqlFields from "graphql-fields";
import { UserRole } from "@app/entity";
import { HashtagListArgs } from "./hashtag.args";
import { HashtagCreateInput } from "./hashtag.input";
import { Hashtag, HashtagList, HashtagSource } from "./hashtag.model";
import { HashtagService } from "./hashtag.service";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { UserRoleGuard } from "@app/auth/guards/role.guard";

/**
 * 해시태그 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => Hashtag)
export class HashtagResolver {
  #hashtagService: HashtagService;

  constructor(hashtagService: HashtagService) {
    this.#hashtagService = hashtagService;
  }

  @Query(returns => Hashtag, {
    description: dedent`
      특정 해시태그를 조회합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 존재하지 않은 해시태그입니다.
    `,
  })
  async hashtag(@Args("id", { type: () => ID, description: "해시태그 ID" }) id: string): Promise<Hashtag> {
    const hashtag = await this.#hashtagService.findOne(id);
    if (hashtag == null) throw new NotFoundGraphQLError("존재하지 않은 해시태그입니다.");
    return hashtag;
  }

  @Query(returns => HashtagList, {
    description: dedent`
      전체 해시태그 목록을 조회합니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
    `,
  })
  async hashtags(@Args() args: HashtagListArgs, @Info() info: GraphQLResolveInfo): Promise<HashtagList> {
    const fields = graphqlFields(info);
    let result: Partial<HashtagList> = {};

    if ("totalCount" in fields) {
      result = {
        ...result,
        totalCount: await this.#hashtagService.countByFilterArgs(args),
      };
    }
    if ("edges" in fields || "pageInfo" in fields) {
      const edges = await this.#hashtagService.getEdges(args);
      result = {
        ...result,
        edges: edges,
        pageInfo: await this.#hashtagService.getPageInfo(edges, args),
      };
    }

    return result as HashtagList;
  }

  @Mutation(returns => Hashtag, {
    description: dedent`
      해시태그를 생성합니다. 이미 같은 키워드에 해시태그가 존재한다면 기존의 해시태그를 불러옵니다.

      **에러 코드**
      \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async createHashtag(
    @Args("data", { description: "해시태그 생성 데이터" }) data: HashtagCreateInput,
  ): Promise<Hashtag> {
    let hashtag = await this.#hashtagService.findOneByKeyword(data.keyword);
    if (hashtag == null) hashtag = await this.#hashtagService.createOne(data);
    return hashtag;
  }

  @Mutation(returns => Hashtag, {
    description: dedent`
      특정 해시태그를 삭제합니다. 해시태그 삭제는 관리자만 가능합니다.

      **에러 코드**
      \`FORBIDDEN\`: 권한이 없습니다.
      \`NOT_FOUND\`: 존재하지 않은 해시태그입니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteHashtag(@Args("id", { type: () => ID, description: "해시태그 ID" }) id: string): Promise<Hashtag> {
    let hashtag = await this.#hashtagService.findOne(id);
    if (hashtag == null) throw new NotFoundGraphQLError("존재하지 않은 해시태그입니다.");
    hashtag = await this.#hashtagService.deleteOne(id);
    return hashtag;
  }

  @Mutation(returns => [Hashtag], {
    description: dedent`
     여러 개의 해시태그를 삭제합니다. 해시태그 삭제는 관리자만 가능합니다.

     존재하지 않은 해시태그는 무시됩니다.

     **에러 코드**
     \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteManyHashtags(
    @Args("ids", { type: () => [ID], description: "해시태그 ID 목록" }) ids: string[],
  ): Promise<Hashtag[]> {
    const hashtag = await this.#hashtagService.deleteMany(ids);
    return hashtag;
  }

  @Mutation(returns => [HashtagSource], {
    description: dedent`
      특정 키워드로 해시태그를 검색합니다.
    `,
  })
  async searchHashtag(
    @Args("keyword", { description: "검색 키워드" }) keyword: string,
    @Args("size", { type: () => Int, nullable: true, description: "가져올 검색 결과 수" }) size: number,
  ): Promise<HashtagSource[]> {
    return await this.#hashtagService.search(keyword, size);
  }
}
