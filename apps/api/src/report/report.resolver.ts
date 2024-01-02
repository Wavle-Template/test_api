import graphqlFields from "graphql-fields";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BadRequestGraphQLError, IPagination, NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { GraphQLResolveInfo } from "graphql";
import { UserRole } from "@app/entity";
import { Report, ReportList } from "./report.model";
import { ReportService } from "./report.service";
import { ReportEntity } from "./report.entity";
import { ReportListArgs } from "./report.args";
import { ReportCreateInput, ReportUpdateInput } from "./report.input";
import dedent from "dedent";
import { ReportLoader } from "./report.loader";
import { UserLoader } from "../user/user.loader";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { User } from "@app/user/user.model";
import { GraphQLFile } from "@app/file";
import { OpenGuard } from "@app/auth/guards/open.guard";

@Resolver(of => Report)
export class ReportResolver {
  constructor(public reportService: ReportService, public reportLoader: ReportLoader, public userLoader: UserLoader) { }

  @Query(returns => Report, {
    description: dedent`
      특정 신고를 조회합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`NOT_FOUND\`: 해당 신고 내역을 찾을 수 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async reportForAdmin(@Args("id", { type: () => ID, description: "신고 ID" }) id: string): Promise<Report> {
    const report = await this.reportService.findOne(id);
    if (report == null) {
      throw new NotFoundGraphQLError("해당 신고를 찾을 수 없습니다.");
    }
    return report as Report;
  }

  @Query(returns => ReportList, {
    description: dedent`
      전체 신고 내역을 가져옵니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async reportsForAdmin(@Args() args: ReportListArgs, @Info() info: GraphQLResolveInfo): Promise<ReportList> {
    const fields = graphqlFields(info);
    let result: Partial<IPagination<ReportEntity>> = {};

    if ("totalCount" in fields) {
      result = {
        ...result,
        totalCount: await this.reportService.countByFilterArgs(args),
      };
    }
    if ("edges" in fields || "pageInfo" in fields) {
      const edges = await this.reportService.getEdges(args);
      result = {
        ...result,
        edges: edges,
        pageInfo: await this.reportService.getPageInfo(edges, args),
      };
    }

    return result as Promise<ReportList>;
  }

  @Query(returns => ReportList, {
    description: dedent`
      나의 전체 신고 내역을 가져옵니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
    `,
  })
  @UseGuards(JwtGuard)
  async myReports(
    @Args() args: ReportListArgs,
    @Info() info: GraphQLResolveInfo,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload): Promise<ReportList> {
    const fields = graphqlFields(info);
    let result: Partial<IPagination<ReportEntity>> = {};

    if ("totalCount" in fields) {
      result = {
        ...result,
        totalCount: await this.reportService.countByUserId(jwtPayload.id,args),
      };
    }
    if ("edges" in fields || "pageInfo" in fields) {
      const edges = await this.reportService.getEdgesByUserId(jwtPayload.id, args);
      result = {
        ...result,
        edges: edges,
        pageInfo: await this.reportService.getPageInfoByUserId(jwtPayload.id,edges, args),
      };
    }

    return result as Promise<ReportList>;
  }

  @Mutation(returns => Report, {
    description: dedent`
      신고를 생성합니다. 사용자가 신고 기능을 사용하고 싶을 때 사용합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`BAD_USER_INPUT\`: 신고 내용은 500자 이하로 입력해주세요.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  async createReport(
    @Args("data") data: ReportCreateInput,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<Report> {
    const { fileIds: file__ids, ...otherData } = data;
    if (data.content.length > 500) {
      throw new BadRequestGraphQLError("신고 내용은 500자 이하로 입력해주세요.");
    }
    return (await this.reportService.createOne({
      ...otherData,
      author: { id: jwtPayload.id },
      targetUser: { id: data.targetUserId },
      files: file__ids ? file__ids.map(id => ({ id: id })) : null,
    })) as Report;
  }

  @Mutation(returns => Report, { description: "신고 내역 단일 수정 (파일 수정 제외)" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async updateReportForAdmin(
    @Args("id", { type: () => ID, description: "신고 ID" }) id: string,
    @Args("data") data: ReportUpdateInput,
  ): Promise<Report> {
    return (await this.reportService.updateOne(id, data)) as Report;
  }

  @Mutation(returns => [Report], { description: "복수 신고 내역 일괄 수정 (파일 수정 제외)" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async updateManyReportForAdmin(
    @Args("ids", { type: () => [ID], description: "신고 ID" }) ids: string[],
    @Args("data") data: ReportUpdateInput,
  ): Promise<Report[]> {
    return (await this.reportService.updateMany(ids, data)) as Report[];
  }

  @Mutation(returns => Report, { description: "신고 내역 단일 삭제" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteReportForAdmin(@Args("id", { type: () => ID, description: "report uuid" }) id: string): Promise<Report> {
    return (await this.reportService.softDeleteOne(id)) as Report;
  }

  @Mutation(returns => [Report], { description: "신고 내역 복수 삭제" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteManyReportsForAdmin(
    @Args("ids", { type: () => [ID], description: "report uuid" }) ids: string[],
  ): Promise<Report[]> {
    return (await this.reportService.softDeleteMany(ids)) as Report[];
  }

  @ResolveField(returns => User, { description: "신고 작성자" })
  async author(@Parent() report: Report): Promise<User> {
    return this.reportLoader.getAuthor(report.id);
  }

  @ResolveField(returns => User, { description: "신고 당한 사용자" })
  async targetUser(@Parent() report: Report): Promise<User> {
    return this.reportLoader.getTargetUser(report.id);
  }

  @ResolveField(returns => [GraphQLFile], { description: "신고 파일", nullable: true })
  async files(@Parent() report: Report): Promise<GraphQLFile[]> {
    return this.reportLoader.getFiles(report.id) as Promise<GraphQLFile[]>;
  }

  @ResolveField(_ => String, { description: "관리자용 유저 메모", nullable: true })
  @UseGuards(OpenGuard)
  async adminMemo(@Parent() report: ReportEntity, @CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
    if (jwtPayload == null) return null;
    const info = await this.userLoader.getInfo(jwtPayload.id);
    if (info === undefined || info === null) {
      return null;
    } else if (info.role === UserRole.ADMIN) {
      return report.adminMemo
    } else {
      return null;
    }
  }
}
