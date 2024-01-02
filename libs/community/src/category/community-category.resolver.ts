import * as graphqlFields from "graphql-fields";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Info, Mutation, Query, Resolver } from "@nestjs/graphql";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import {
  CommunityCategory,
  CommunityCategoryList,
} from "./community-category.model";
import { CommunityCategoryService } from "./community-category.service";
import { GraphQLResolveInfo } from "graphql";
import { CommunityCategoryEntity } from "./community-category.entity";
import { CommunityCategoryListArgs } from "./community-category.args";
import { Edge } from "@yumis-coconudge/typeorm-helper";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { UserRole } from "@app/entity";
import { CommunityCategoryCreateInput, CommunityCategoryUpdateInput } from "./community-category.input";


@Resolver(of => CommunityCategory)
export class CommunityCategoryResolver {
  #communityCategoryService: CommunityCategoryService;
  constructor(communityCategoryService: CommunityCategoryService) {
    this.#communityCategoryService = communityCategoryService;
  }

  @Query(returns => CommunityCategory, { description: "커뮤니티 카테고리 단일 조회" })
  @UseGuards(JwtGuard)
  async communityCategory(@Args("id", { type: () => ID }) id: string): Promise<CommunityCategoryEntity> {
    const community = await this.#communityCategoryService.findOne(id);
    if (!community) {
      throw new NotFoundGraphQLError("해당 커뮤니티 카테고리가 존재하지 않습니다.");
    }
    return community;
  }

  @Query(returns => CommunityCategoryList, { description: "커뮤니티 카테고리 목록 조회" })
  @UseGuards(JwtGuard)
  async communityCategories(
    @Args() args: CommunityCategoryListArgs,
    @Info() info: GraphQLResolveInfo
  ): Promise<Partial<CommunityCategoryList>> {
    const fields = graphqlFields(info);
    let result: Partial<CommunityCategoryList> = {};

    if ("totalCount" in fields) {
      result = {
        ...result,
        totalCount: await this.#communityCategoryService.countByFilterArgs(args)
      };
    }
    if ("edges" in fields || "pageInfo" in fields) {
      const edges = await this.#communityCategoryService.getEdges(args);
      result = {
        ...result,
        edges: edges as unknown as Edge<CommunityCategory>[],
        pageInfo: await this.#communityCategoryService.getPageInfo(edges, args)
      };
    }

    return result;
  }

  @Mutation(returns => CommunityCategory, { description: "커뮤니티 카테고리 생성 - 관리자 권한" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async createCommunityCategoryForAdmin(
    @Args("data") data: CommunityCategoryCreateInput
  ): Promise<CommunityCategoryEntity> {
    return await this.#communityCategoryService.createOne(data);
  }

  @Mutation(returns => CommunityCategory, { description: "커뮤니티 카테고리 단일 수정" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async updateCommunityCategoryForAdmin(
    @Args("id", { type: () => ID }) id: string,
    @Args("data") data: CommunityCategoryUpdateInput
  ): Promise<CommunityCategoryEntity> {
    return await this.#communityCategoryService.updateOne(id, data);
  }

  @Mutation(returns => CommunityCategory, { description: "커뮤니티 카테고리 단일 삭제" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteCommunityCategoryForAdmin(@Args("id", { type: () => ID }) id: string): Promise<CommunityCategoryEntity> {
    return await this.#communityCategoryService.deleteOne(id);
  }

  @Mutation(returns => [CommunityCategory], { description: "커뮤니티 카테고리 복수 삭제" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteCommunityCategoriesForAdmin(
    @Args("ids", { type: () => [ID] }) ids: string[]
  ): Promise<CommunityCategoryEntity[]> {
    return await this.#communityCategoryService.deleteMany(ids);
  }
}
