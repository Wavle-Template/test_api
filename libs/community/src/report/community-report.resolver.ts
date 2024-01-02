import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UserRole } from "@app/entity";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BadRequestGraphQLError, NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { GraphQLResolveInfo } from "graphql";
import { CommunityReportEntity } from "./community-report.entity";
import { CommunityReport, CommunityReportCreateInput, CommunityReportList, CommunityReportListArgs, CommunityReportTarget, CommunityReportUpdateInput } from "./community-report.model";
import { CommunityReportService } from "./community-report.service";
import graphqlFields from 'graphql-fields'
import { Edge } from "@yumis-coconudge/typeorm-helper";
import { UserService } from "apps/api/src/user/user.service";
import { CommunityReportState, CommunityReportType } from "./community-report.enum";
import { User } from "@app/user/user.model";
import { BaseUserLoader } from "@app/user/user.loader";
import { OpenGuard } from "@app/auth/guards/open.guard";
import { FileService, GraphQLFile } from "@app/file";
import { CommunityReportLoader } from "./community-report.loader";
import { UserRoleGuard } from "@app/auth/guards/role.guard";


@Resolver(of => CommunityReport)
export class CommunityReportResolver {
    #communityReportService: CommunityReportService;
    // #userService: UserService;
    #userBasicLoader: BaseUserLoader;
    #communityReportLoader: CommunityReportLoader;
    #fileService: FileService;
    constructor(
        communityReportService: CommunityReportService,
        // private userService: UserService,
        userBasicLoader: BaseUserLoader,
        communityReportLoader: CommunityReportLoader,
        fileService: FileService
    ) {
        this.#communityReportService = communityReportService;
        // this.#userService = userService;
        this.#userBasicLoader = userBasicLoader;
        this.#communityReportLoader = communityReportLoader;
        this.#fileService = fileService;
    }

    @Query(returns => CommunityReport, { description: "커뮤니티 신고 단일 조회" })
    @UseGuards(JwtGuard)
    async communityReport(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<CommunityReportEntity> {
        const report = await this.#communityReportService.findOne(id, ["author"]);
        if (!report) {
            throw new NotFoundGraphQLError("해당 커뮤니티 신고를 찾을 수 없습니다.", "id");
        } else if (report.authorId !== jwtPayload.id) {
            throw new NotFoundGraphQLError("해당 커뮤니티 신고를 찾을 수 없습니다.", "id");
        }

        return report;
    }

    @Query(returns => CommunityReport, { description: "커뮤니티 신고 단일 조회 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async communityReportForAdmin(
        @Args("id", { type: () => ID }) id: string,
    ): Promise<CommunityReportEntity> {
        const report = await this.#communityReportService.findOne(id, ["author"]);
        if (!report) {
            throw new NotFoundGraphQLError("해당 커뮤니티 신고를 찾을 수 없습니다.", "id");
        }
        return report;
    }

    @Query(returns => CommunityReportList, { description: "커뮤니티 신고 목록 조회 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async communityReportsForAdmin(
        @Args() args: CommunityReportListArgs,
        @Info() info: GraphQLResolveInfo,
    ): Promise<CommunityReportList> {
        const fields = graphqlFields(info);
        let result: Partial<CommunityReportList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.#communityReportService.countByFilterArgs(args)
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.#communityReportService.getEdges(args);
            result = {
                ...result,
                edges: edges as unknown as Edge<CommunityReport>[],
                pageInfo: await this.#communityReportService.getPageInfo(edges, args)
            };
        }

        return result as CommunityReportList
    }

    @Query(returns => CommunityReportList, { description: "내 커뮤니티 신고 목록 조회" })
    @UseGuards(JwtGuard)
    async myCommunityReports(
        @Args() args: CommunityReportListArgs,
        @Info() info: GraphQLResolveInfo,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<CommunityReportList> {
        const fields = graphqlFields(info);
        let result: Partial<CommunityReportList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.#communityReportService.countByUserId(jwtPayload.id, args)
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.#communityReportService.getEdgesByUserId(jwtPayload.id, args);
            result = {
                ...result,
                edges: edges as unknown as Edge<CommunityReport>[],
                pageInfo: await this.#communityReportService.getPageInfoByUserId(jwtPayload.id, edges, args)
            };
        }

        return result as CommunityReportList
    }


    @Mutation(returns => CommunityReport, { description: "커뮤니티 신고 생성" })
    @UseGuards(JwtGuard)
    async createCommunityReport(
        @Args("data") data: CommunityReportCreateInput,
        @CurrentJwtPayload() currentUser: AuthTokenPayload
    ): Promise<CommunityReportEntity> {
        let newPost: CommunityReportEntity = null;

        newPost = await this.#communityReportService.createOne({
            ...data,
            author: { id: currentUser.id },

            files: data.file__ids != null ? data.file__ids.map(fileId => ({ id: fileId })) : undefined
        });
        return newPost;
    }

    @Mutation(returns => CommunityReport, { description: "커뮤니티 게시물 수정" })
    @UseGuards(JwtGuard)
    async updateCommunityReport(
        @Args("id", { type: () => ID }) id: string,
        @Args("data") data: CommunityReportUpdateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<CommunityReportEntity> {

        const post = await this.#communityReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        } else if (post.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        }

        const updatedPost = await this.#communityReportService.updateOne(id, {
            ...data,
        });
        return updatedPost;
    }

    @Mutation(returns => CommunityReport, { description: "커뮤니티 신고물 파일 변경" })
    @UseGuards(JwtGuard)
    async updateCommunityReportFiles(
        @Args("id", { type: () => ID }) id: string,
        @Args("fileIds", { type: () => [ID] }) fileIds: string[],
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<CommunityReportEntity> {
        const post = await this.#communityReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        } else if (post.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        }
        await this.#fileService.setPriority(fileIds);
        const updatedPost = await this.#communityReportService.updateFiles(id, fileIds);
        return updatedPost;
    }

    @Mutation(returns => CommunityReport, { description: "커뮤니티 신고 단일 삭제" })
    @UseGuards(JwtGuard)
    async deleteCommunityReport(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<CommunityReportEntity> {
        const post = await this.#communityReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        } else if (post.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        } else if (post.state !== CommunityReportState.PENDING) {
            throw new BadRequestGraphQLError("삭제 할 수 있는 상태가 아닙니다.");
        }
        const deletedPost = await this.#communityReportService.deleteOne(id);
        return deletedPost;
    }

    @Mutation(returns => CommunityReport, { description: "커뮤니티 신고 변경 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateCommunityReportForAdmin(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
        @Args("state", { type: () => CommunityReportState, nullable: true, description: "상태" }) state?: CommunityReportState,
        @Args("adminMemo", { type: () => String, nullable: true, description: "관리자 메모" }) adminMemo?: string
    ): Promise<CommunityReportEntity> {
        const post = await this.#communityReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        }
        const updatedPost = await this.#communityReportService.updateOne(id, {
            state, adminMemo
        });
        return updatedPost;
    }

    @ResolveField(type => User, { description: "작성자" })
    async author(@Parent() report: CommunityReportEntity) {
        return await this.#userBasicLoader.getInfo(report.authorId);
    }

    @ResolveField(type => CommunityReportTarget, { description: "신고 타겟 데이터", nullable: true })
    async targetInfo(@Parent() report: CommunityReportEntity) {
        return this.#communityReportLoader.getTargetInfo({ id: report.targetId, type: report.type as CommunityReportType });
    }

    @ResolveField(type => User, { description: "관리자 메모" })
    @UseGuards(OpenGuard)
    async adminMemo(@Parent() report: CommunityReportEntity, @CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
        if (jwtPayload == null) return null;
        const info = await this.#userBasicLoader.getInfo(jwtPayload.id);
        if (info === undefined || info === null) {
            return null;
        } else if (info.role === UserRole.ADMIN) {
            return report.adminMemo
        } else {
            return null;
        }
    }

    @ResolveField(returns => [GraphQLFile], { description: "신고 파일", nullable: true })
    async files(@Parent() report: CommunityReport): Promise<GraphQLFile[]> {
        return this.#communityReportLoader.getFiles(report.id) as Promise<GraphQLFile[]>;
    }
}