import * as graphqlFields from "graphql-fields";
import { UseGuards } from "@nestjs/common";
import { Args, ArgsType, ID, Info, Mutation, Query, Resolver } from "@nestjs/graphql";
import { GraphQLResolveInfo } from "graphql";
import { IPagination, NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import {
    MatchPostType,
    MatchPostTypeCreateInput,
    MatchPostTypeList,
    MatchPostTypeListArgs,
    MatchPostTypeUpdateInput
} from "./match-post-type.model";
import { MatchPostTypeService } from "./match-post-type.service";
import { MatchPostTypeEntity } from "./match-post-type.entity";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { UserRole } from "@app/entity";
import { UserRoleGuard } from "@app/auth/guards/role.guard";

@Resolver(of => MatchPostType)
export class MatchPostTypeResolver {
    #matchCategoryService: MatchPostTypeService;
    constructor(MatchPostTypeService: MatchPostTypeService) {
        this.#matchCategoryService = MatchPostTypeService;
    }

    @Query(returns => MatchPostType, { description: "매칭 게시물 타입 단일 조회" })
    async matchPostType(@Args("id", { type: () => ID }) id: string): Promise<MatchPostTypeEntity> {
        const MatchPostType = await this.#matchCategoryService.findOne(id);
        if (!MatchPostType) {
            throw new NotFoundGraphQLError("해당 매칭 게시물 타입가 존재하지 않습니다.");
        }
        return MatchPostType;
    }

    @Query(returns => MatchPostTypeList, { description: "매칭 게시물 타입 목록 조회" })
    async matchPostTypes(
        @Args() args: MatchPostTypeListArgs,
        @Info() info: GraphQLResolveInfo
    ): Promise<Partial<IPagination<MatchPostTypeEntity>>> {
        const fields = graphqlFields(info);
        let result: Partial<IPagination<MatchPostTypeEntity>> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.#matchCategoryService.countByFilterArgs(args)
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.#matchCategoryService.getEdges(args);
            result = {
                ...result,
                edges: edges,
                pageInfo: await this.#matchCategoryService.getPageInfo(edges, args)
            };
        }

        return result;
    }

    @Mutation(returns => MatchPostType, { description: "매칭 게시물 타입 생성 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async createMatchPostTypeForAdmin(@Args("data") data: MatchPostTypeCreateInput): Promise<MatchPostTypeEntity> {
        return await this.#matchCategoryService.createOne(data);
    }

    @Mutation(returns => MatchPostType, { description: "매칭 게시물 타입 단일 수정 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateMatchPostTypeForAdmin(
        @Args("id", { type: () => ID }) id: string,
        @Args("data") data: MatchPostTypeUpdateInput
    ): Promise<MatchPostTypeEntity> {
        return await this.#matchCategoryService.updateOne(id, data);
    }

    @Mutation(returns => MatchPostType, { description: "매칭 게시물 타입 단일 삭제 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteMatchPostTypeForAdmin(@Args("id", { type: () => ID }) id: string): Promise<MatchPostTypeEntity> {
        return await this.#matchCategoryService.deleteOne(id);
    }

    @Mutation(returns => [MatchPostType], { description: "매칭 게시물 타입 복수 삭제 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteMatchPostTypesForAdmin(@Args("ids", { type: () => [ID] }) ids: string[]): Promise<MatchPostTypeEntity[]> {
        return await this.#matchCategoryService.deleteMany(ids);
    }
}