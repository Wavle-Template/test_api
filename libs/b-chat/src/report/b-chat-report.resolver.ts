import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UserRole } from "@app/entity";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BadRequestGraphQLError, NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { GraphQLResolveInfo } from "graphql";
import graphqlFields from 'graphql-fields'
import { Edge } from "@yumis-coconudge/typeorm-helper";
import { User } from "@app/user/user.model";
import { BaseUserLoader } from "@app/user/user.loader";
import { OpenGuard } from "@app/auth/guards/open.guard";
import { FileService, GraphQLFile } from "@app/file";
import { BusinessChatReportService } from "./b-chat-report.service";
import { BusinessChatReportLoader } from "./b-chat-report.loader";
import { BusinessChatReport, BusinessChatReportCreateInput, BusinessChatReportList, BusinessChatReportListArgs, BusinessChatReportUpdateInput } from "./b-chat-report.model";
import { BusinessChatReportEntity } from "./b-chat-report.entity";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { ChatReportState, ChatReportTarget, ChatReportType } from "@app/common-chat-res";


@Resolver(of => BusinessChatReport)
export class BusinessChatReportResolver {
    #businessChatReportService: BusinessChatReportService;
    // #userService: UserService;
    #userBasicLoader: BaseUserLoader;
    #bChatReportLoader: BusinessChatReportLoader;
    #fileService: FileService;
    constructor(
        businessChatReportService: BusinessChatReportService,
        // private userService: UserService,
        userBasicLoader: BaseUserLoader,
        bChatReportLoader: BusinessChatReportLoader,
        fileService: FileService
    ) {
        this.#businessChatReportService = businessChatReportService;
        // this.#userService = userService;
        this.#userBasicLoader = userBasicLoader;
        this.#bChatReportLoader = bChatReportLoader;
        this.#fileService = fileService;
    }

    @Query(returns => BusinessChatReport, { description: "비즈니스 채팅 신고 단일 조회", name: "businessChatReport" })
    @UseGuards(JwtGuard)
    async chatReport(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<BusinessChatReportEntity> {
        const report = await this.#businessChatReportService.findOne(id, ["author"]);
        if (!report) {
            throw new NotFoundGraphQLError("해당 비즈니스 채팅 신고를 찾을 수 없습니다.", "id");
        } else if (report.authorId !== jwtPayload.id) {
            throw new NotFoundGraphQLError("해당 비즈니스 채팅 신고를 찾을 수 없습니다.", "id");
        }

        return report;
    }

    @Query(returns => BusinessChatReport, {
        description: "비즈니스 채팅 신고 단일 조회 - 관리자용",
        name: "businessChatReportForAdmin"
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async chatReportForAdmin(
        @Args("id", { type: () => ID }) id: string,
    ): Promise<BusinessChatReportEntity> {
        const report = await this.#businessChatReportService.findOne(id, ["author"]);
        if (!report) {
            throw new NotFoundGraphQLError("해당 비즈니스 채팅 신고를 찾을 수 없습니다.", "id");
        }
        return report;
    }

    @Query(returns => BusinessChatReportList,
        {
            description: "비즈니스 채팅 신고 목록 조회 - 관리자용",
            name: "businessChatReportsForAdmin"
        }
    )
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async chatReportsForAdmin(
        @Args() args: BusinessChatReportListArgs,
        @Info() info: GraphQLResolveInfo,
    ): Promise<BusinessChatReportList> {
        const fields = graphqlFields(info);
        let result: Partial<BusinessChatReportList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.#businessChatReportService.countByFilterArgs(args)
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.#businessChatReportService.getEdges(args);
            result = {
                ...result,
                edges: edges as unknown as Edge<BusinessChatReport>[],
                pageInfo: await this.#businessChatReportService.getPageInfo(edges, args)
            };
        }

        return result as BusinessChatReportList
    }

    @Query(returns => BusinessChatReportList,
        {
            description: "내 비즈니스 채팅 신고 목록 조회",
            name: "myBusinessChatReports"
        })
    @UseGuards(JwtGuard)
    async myChatReports(
        @Args() args: BusinessChatReportListArgs,
        @Info() info: GraphQLResolveInfo,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<BusinessChatReportList> {
        const fields = graphqlFields(info);
        let result: Partial<BusinessChatReportList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.#businessChatReportService.countByUserId(jwtPayload.id, args)
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.#businessChatReportService.getEdgesByUserId(jwtPayload.id, args);
            result = {
                ...result,
                edges: edges as unknown as Edge<BusinessChatReport>[],
                pageInfo: await this.#businessChatReportService.getPageInfoByUserId(jwtPayload.id, edges, args)
            };
        }

        return result as BusinessChatReportList
    }


    @Mutation(returns => BusinessChatReport,
        {
            description: "비즈니스 채팅 신고 생성",
            name: "createBusinessChatReport"
        })
    @UseGuards(JwtGuard)
    async createChatReport(
        @Args("data") data: BusinessChatReportCreateInput,
        @CurrentJwtPayload() currentUser: AuthTokenPayload
    ): Promise<BusinessChatReportEntity> {
        let newPost: BusinessChatReportEntity = null;

        newPost = await this.#businessChatReportService.createOne({
            ...data,
            author: { id: currentUser.id },

            files: data.file__ids != null ? data.file__ids.map(fileId => ({ id: fileId })) : undefined
        });
        return newPost;
    }

    @Mutation(returns => BusinessChatReport, {
        description: "비즈니스 채팅 게시물 수정",
        name: "updateBusinessChatReport"
    })
    @UseGuards(JwtGuard)
    async updateChatReport(
        @Args("id", { type: () => ID }) id: string,
        @Args("data") data: BusinessChatReportUpdateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<BusinessChatReportEntity> {

        const post = await this.#businessChatReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        } else if (post.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        }

        const updatedPost = await this.#businessChatReportService.updateOne(id, {
            ...data,
        });
        return updatedPost;
    }

    @Mutation(returns => BusinessChatReport, {
        description: "비즈니스 채팅 신고물 파일 변경",
        name: "updateBusinessChatReportFiles"
    })
    @UseGuards(JwtGuard)
    async updateChatReportFiles(
        @Args("id", { type: () => ID }) id: string,
        @Args("fileIds", { type: () => [ID] }) fileIds: string[],
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<BusinessChatReportEntity> {
        const post = await this.#businessChatReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        } else if (post.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        }
        await this.#fileService.setPriority(fileIds)
        const updatedPost = await this.#businessChatReportService.updateFiles(id, fileIds);
        return updatedPost;
    }

    @Mutation(returns => BusinessChatReport, {
        description: "비즈니스 채팅 신고 단일 삭제",
        name: "deleteBusinessChatReport"
    })
    @UseGuards(JwtGuard)
    async deleteChatReport(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<BusinessChatReportEntity> {
        const post = await this.#businessChatReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        } else if (post.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        } else if (post.state !== ChatReportState.PENDING) {
            throw new BadRequestGraphQLError("삭제 할 수 있는 상태가 아닙니다.");
        }
        const deletedPost = await this.#businessChatReportService.deleteOne(id);
        return deletedPost;
    }

    @Mutation(returns => BusinessChatReport,
        {
            description: "비즈니스 채팅 신고 변경 - 관리자용",
            name: "updateBusinessChatReportForAdmin"
        })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateChatReportForAdmin(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
        @Args("state", { type: () => ChatReportState, nullable: true, description: "상태" }) state?: ChatReportState,
        @Args("adminMemo", { type: () => String, nullable: true, description: "관리자 메모" }) adminMemo?: string
    ): Promise<BusinessChatReportEntity> {
        const post = await this.#businessChatReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        }
        const updatedPost = await this.#businessChatReportService.updateOne(id, {
            state, adminMemo
        });
        return updatedPost;
    }

    @ResolveField(type => User, { description: "작성자" })
    async author(@Parent() report: BusinessChatReportEntity) {
        return await this.#userBasicLoader.getInfo(report.authorId);
    }

    @ResolveField(type => ChatReportTarget, { description: "신고 타겟 데이터", nullable: true })
    async targetInfo(@Parent() report: BusinessChatReportEntity) {
        return this.#bChatReportLoader.getTargetInfo({ id: report.targetId, type: report.type as ChatReportType });
    }

    @ResolveField(type => User, { description: "관리자 메모" })
    @UseGuards(OpenGuard)
    async adminMemo(@Parent() report: BusinessChatReportEntity, @CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
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
    async files(@Parent() report: BusinessChatReportEntity): Promise<GraphQLFile[]> {
        return this.#bChatReportLoader.getFiles(report.id) as Promise<GraphQLFile[]>;
    }
}