import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService, PaginationArgs } from "@yumis-coconudge/common-module";
import { Edge, FilterArgs } from "@yumis-coconudge/typeorm-helper";
import { DeepPartial, Repository } from "typeorm";
import { ChatReportEntity } from "./chat-report.entity";


@Injectable()
export class ChatReportService extends CRUDService<ChatReportEntity> {
    constructor(@InjectRepository(ChatReportEntity) chatReportRepository: Repository<ChatReportEntity>) {
        super(chatReportRepository);
    }

    async updateFiles(id: string, fileIds: string[]): Promise<ChatReportEntity> {
        const post = (await this.repository.findOne({
            where: { id: id },
            relations: ["files"]
        })) as DeepPartial<ChatReportEntity>;

        post.files = fileIds.map(id => ({ id: id }));

        return await this.repository.save(post);
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
        edges: Edge<ChatReportEntity>[],
        args: PaginationArgs,
    ) {
        let builder = this.getQueryBuilder("reports")
            .leftJoin("reports.author", "author")
            .where("author.id = :userId", { userId: userId });

        return await this.getPageInfo(edges, args, builder)
    }

}
