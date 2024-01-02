import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService, PaginationArgs } from "@yumis-coconudge/common-module";
import { Edge } from "@yumis-coconudge/typeorm-helper";
import {Repository } from "typeorm";
import { ChatReportBaseEntity } from "./chat-report.entity";


@Injectable()
export abstract class AbsChatReportService extends CRUDService<ChatReportBaseEntity> {
    constructor(@InjectRepository(ChatReportBaseEntity) chatReportRepository: Repository<ChatReportBaseEntity>) {
        super(chatReportRepository);
    }

    async getPageInfoByUserId(
        userId: string,
        edges: Edge<ChatReportBaseEntity>[],
        args: PaginationArgs,
    ) {
        let builder = this.getQueryBuilder("reports")
            .leftJoin("reports.author", "author")
            .where("author.id = :userId", { userId: userId });

        return await this.getPageInfo(edges, args, builder)
    }

}
