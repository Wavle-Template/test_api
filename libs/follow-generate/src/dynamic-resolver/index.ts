import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { OpenGuard } from "@app/auth/guards/open.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { Provider } from "@nestjs/common";
import { Inject, UseGuards } from "@nestjs/common";
import { Args, Info, Query, Resolver } from "@nestjs/graphql";
import { CRUDService, IPagination, DefaultEntity, DefaultModel } from "@yumis-coconudge/common-module";
import { Edge, MixedArgs } from "@yumis-coconudge/typeorm-helper";
import { GraphQLResolveInfo } from "graphql";
import graphqlFields from "graphql-fields";
import { EntityTarget, getConnection } from "typeorm";
import { FollowCommonService } from "../follow-common.service";

interface IDynamicResolverOption {
    /** 연결된 User 컬럼명 */
    userColumn?: string,
    /** graphql query 설명 */
    description?: string
}

function checkExistColumn(userColumn: string = "user", entity: EntityTarget<DefaultEntity>) {

    const relationIds = getConnection().getMetadata(entity).relationIds;
    const relations = getConnection().getMetadata(entity).relations;
    if (userColumn.toLowerCase().includes("id")) {
        return relationIds.some(item => item.propertyName === userColumn);
    } else {
        return relations.some(item => item.propertyName === userColumn);
    }
}

/**
 * 
 * @param listModel 반환되는 List Pagination 모델
 * @param crudService 사용처 모듈의 CRUD Service Provider
 * @param argsModel List Args Model
 * @param queryName 만들 Graphql 쿼리명
 * @param option IDynamicResolverOption 
 * @template Model 기본 모델
 * @template Entity Entity
 * @template ArgsType List Args
 * @returns DynamicResolver
 */
function generateDynamicResolver<Model extends DefaultModel, Entity extends DefaultEntity, ArgsType extends MixedArgs>(listModel: IPagination<Model>, crudService: Provider<CRUDService<Entity>>, argsModel: ArgsType, queryName: string, option: IDynamicResolverOption) {

    @Resolver()
    class DynamicResolver {
        #service: CRUDService<Entity>;
        #followFacadeService: FollowCommonService;
        #alias = "entities";
        #query = option?.userColumn ? (option.userColumn.toLowerCase().includes("id") ? `entities.${option.userColumn}` : `entities.${option.userColumn}Id`) : "entities.userId";
        constructor(
            @Inject(crudService) service: CRUDService<Entity>,
            followFacadeService: FollowCommonService
        ) {
            this.#service = service;
            this.#followFacadeService = followFacadeService;
        }

        @Query(returns => listModel, {
            description: option?.description ?? undefined,
            name: queryName
        })
        @UseGuards(OpenGuard)
        async dynamicList(
            @Args({ type: () => argsModel }) args: ArgsType,
            @Info() info: GraphQLResolveInfo,
            @CurrentJwtPayload() jwtPayload: AuthTokenPayload
        ): Promise<IPagination<Model>> {
            const fields = graphqlFields(info);

            let result: Partial<IPagination<Model>> = {};

            const builder1 = await this.#service.getQueryBuilder(this.#alias);
            const builder2 = await this.#service.getQueryBuilder(this.#alias);
            const builder3 = await this.#service.getQueryBuilder(this.#alias);
            if (jwtPayload !== null) {
                const followUserIds = await this.#followFacadeService.myFollowUserIds(jwtPayload.id);
                if (followUserIds.length > 0) {
                    builder1.where(`${this.#query} in(:...ids)`, { ids: followUserIds })
                    builder2.where(`${this.#query} in(:...ids)`, { ids: followUserIds })
                    builder3.where(`${this.#query} in(:...ids)`, { ids: followUserIds })
                }
            }


            if ("totalCount" in fields) {
                result = {
                    ...result,
                    totalCount: await this.#service.countByFilterArgs(args, builder1)
                };
            }
            if ("edges" in fields || "pageInfo" in fields) {
                const edges = await this.#service.getEdges(args, builder2);
                result = {
                    ...result,
                    edges: edges as unknown as Edge<Model>[],
                    pageInfo: await this.#service.getPageInfo(edges, args, builder3)
                };
            }

            return result as IPagination<Model>
        }
    }

    return DynamicResolver
}

export { generateDynamicResolver, checkExistColumn, IDynamicResolverOption }