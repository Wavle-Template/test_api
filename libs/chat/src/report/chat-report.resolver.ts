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
import { ChatReportLoader } from "./chat-report.loader";
import { ChatReportEntity } from "./chat-report.entity";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { ChatReport, ChatReportCreateInput, ChatReportList, ChatReportListArgs, ChatReportState, ChatReportTarget, ChatReportType, ChatReportUpdateInput } from "@app/common-chat-res";
import { ChatReportService } from "./chat-report.service";


@Resolver(of => ChatReport)
export class ChatReportResolver {
    #chatReportService: ChatReportService;
    // #userService: UserService;
    #userBasicLoader: BaseUserLoader;
    #chatReportLoader: ChatReportLoader;
    #fileService: FileService;
    constructor(
        chatReportService: ChatReportService,
        // private userService: UserService,
        userBasicLoader: BaseUserLoader,
        chatReportLoader: ChatReportLoader,
        fileService: FileService
    ) {
        this.#chatReportService = chatReportService;
        // this.#userService = userService;
        this.#userBasicLoader = userBasicLoader;
        this.#chatReportLoader = chatReportLoader;
        this.#fileService = fileService;
    }

    @Query(returns => ChatReport, { description: "채팅 신고 단일 조회" })
    @UseGuards(JwtGuard)
    async chatReport(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<ChatReportEntity> {
        const report = await this.#chatReportService.findOne(id, ["author"]);
        if (!report) {
            throw new NotFoundGraphQLError("해당 채팅 신고를 찾을 수 없습니다.", "id");
        } else if (report.authorId !== jwtPayload.id) {
            throw new NotFoundGraphQLError("해당 채팅 신고를 찾을 수 없습니다.", "id");
        }

        return report;
    }

    @Query(returns => ChatReport, { description: "채팅 신고 단일 조회 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async chatReportForAdmin(
        @Args("id", { type: () => ID }) id: string,
    ): Promise<ChatReportEntity> {
        const report = await this.#chatReportService.findOne(id, ["author"]);
        if (!report) {
            throw new NotFoundGraphQLError("해당 채팅 신고를 찾을 수 없습니다.", "id");
        }
        return report;
    }

    @Query(returns => ChatReportList, { description: "채팅 신고 목록 조회 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async chatReportsForAdmin(
        @Args() args: ChatReportListArgs,
        @Info() info: GraphQLResolveInfo,
    ): Promise<ChatReportList> {
        const fields = graphqlFields(info);
        let result: Partial<ChatReportList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.#chatReportService.countByFilterArgs(args)
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.#chatReportService.getEdges(args);
            result = {
                ...result,
                edges: edges as unknown as Edge<ChatReport>[],
                pageInfo: await this.#chatReportService.getPageInfo(edges, args)
            };
        }

        return result as ChatReportList
    }

    @Query(returns => ChatReportList, { description: "내 채팅 신고 목록 조회" })
    @UseGuards(JwtGuard)
    async myChatReports(
        @Args() args: ChatReportListArgs,
        @Info() info: GraphQLResolveInfo,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<ChatReportList> {
        const fields = graphqlFields(info);
        let result: Partial<ChatReportList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.#chatReportService.countByUserId(jwtPayload.id, args)
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.#chatReportService.getEdgesByUserId(jwtPayload.id, args);
            result = {
                ...result,
                edges: edges as unknown as Edge<ChatReport>[],
                pageInfo: await this.#chatReportService.getPageInfoByUserId(jwtPayload.id, edges, args)
            };
        }

        return result as ChatReportList
    }


    @Mutation(returns => ChatReport, { description: "채팅 신고 생성" })
    @UseGuards(JwtGuard)
    async createChatReport(
        @Args("data") data: ChatReportCreateInput,
        @CurrentJwtPayload() currentUser: AuthTokenPayload
    ): Promise<ChatReportEntity> {
        let newPost: ChatReportEntity = null;

        newPost = await this.#chatReportService.createOne({
            ...data,
            author: { id: currentUser.id },

            files: data.file__ids != null ? data.file__ids.map(fileId => ({ id: fileId })) : undefined
        });
        return newPost;
    }

    @Mutation(returns => ChatReport, { description: "채팅 게시물 수정" })
    @UseGuards(JwtGuard)
    async updateChatReport(
        @Args("id", { type: () => ID }) id: string,
        @Args("data") data: ChatReportUpdateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<ChatReportEntity> {

        const post = await this.#chatReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        } else if (post.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        }

        const updatedPost = await this.#chatReportService.updateOne(id, {
            ...data,
        });
        return updatedPost;
    }

    @Mutation(returns => ChatReport, { description: "채팅 신고물 파일 변경" })
    @UseGuards(JwtGuard)
    async updateChatReportFiles(
        @Args("id", { type: () => ID }) id: string,
        @Args("fileIds", { type: () => [ID] }) fileIds: string[],
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<ChatReportEntity> {
        const post = await this.#chatReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        } else if (post.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        }
        await this.#fileService.setPriority(fileIds)
        const updatedPost = await this.#chatReportService.updateFiles(id, fileIds);
        return updatedPost;
    }

    @Mutation(returns => ChatReport, { description: "채팅 신고 단일 삭제" })
    @UseGuards(JwtGuard)
    async deleteChatReport(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<ChatReportEntity> {
        const post = await this.#chatReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        } else if (post.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError();
        } else if (post.state !== ChatReportState.PENDING) {
            throw new BadRequestGraphQLError("삭제 할 수 있는 상태가 아닙니다.");
        }
        const deletedPost = await this.#chatReportService.deleteOne(id);
        return deletedPost;
    }

    @Mutation(returns => ChatReport, { description: "채팅 신고 변경 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateChatReportForAdmin(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
        @Args("state", { type: () => ChatReportState, nullable: true, description: "상태" }) state?: ChatReportState,
        @Args("adminMemo", { type: () => String, nullable: true, description: "관리자 메모" }) adminMemo?: string
    ): Promise<ChatReportEntity> {
        const post = await this.#chatReportService.findOne(id, ["author"]);
        if (post === null) {
            throw new NotFoundGraphQLError();
        }
        const updatedPost = await this.#chatReportService.updateOne(id, {
            state, adminMemo
        });
        return updatedPost;
    }

    @ResolveField(type => User, { description: "작성자" })
    async author(@Parent() report: ChatReportEntity) {
        return await this.#userBasicLoader.getInfo(report.authorId);
    }

    @ResolveField(type => ChatReportTarget, { description: "신고 타겟 데이터", nullable: true })
    async targetInfo(@Parent() report: ChatReportEntity) {
        return this.#chatReportLoader.getTargetInfo({ id: report.targetId, type: report.type as ChatReportType });
    }

    @ResolveField(type => User, { description: "관리자 메모" })
    @UseGuards(OpenGuard)
    async adminMemo(@Parent() report: ChatReportEntity, @CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
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
    async files(@Parent() report: ChatReportEntity): Promise<GraphQLFile[]> {
        return this.#chatReportLoader.getFiles(report.id) as Promise<GraphQLFile[]>;
    }
}