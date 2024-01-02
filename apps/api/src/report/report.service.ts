import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService, PaginationArgs } from "@yumis-coconudge/common-module";
import { Edge, FilterArgs } from "@yumis-coconudge/typeorm-helper";
import { EntityManager } from "typeorm";
import { ReportEntity } from "./report.entity";

@Injectable()
export class ReportService extends CRUDService<ReportEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, ReportEntity);
  }

  async countByUserId(userId: string, args: FilterArgs) {
    let builder = this.getQueryBuilder("reports")
      .leftJoin("reports.author", "author")
      .where("author.id = :userId", { userId: userId });
    return await this.countByFilterArgs(args, builder);
  }

  async getEdgesByUserId(
    userId: string,
    args: PaginationArgs,
  ) {
    let builder = this.getQueryBuilder("reports")
      .leftJoin("reports.author", "author")
      .where("author.id = :userId", { userId: userId });

    return await this.getEdges(args, builder)
  }

  async getPageInfoByUserId(
    userId: string,
    edges: Edge<ReportEntity>[],
    args: PaginationArgs,
  ) {
    let builder = this.getQueryBuilder("reports")
      .leftJoin("reports.author", "author")
      .where("author.id = :userId", { userId: userId });

    return await this.getPageInfo(edges, args, builder)
  }
}
