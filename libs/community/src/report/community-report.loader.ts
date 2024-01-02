import { FileEntity, UserEntity } from "@app/entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { AbstractTypeORMService } from "@yumis-coconudge/common-module";
import DataLoader from "dataloader";
import LRUCache from "lru-cache";
import { EntityManager, In } from "typeorm";
import { CommunityPostEntity } from "../post/community-post.entity";
import { CommunityPostReplyEntity } from "../reply/community-post-reply.entity";
import { CommunityReportEntity } from "./community-report.entity";
import { CommunityReportType } from "./community-report.enum";

interface ITargetInfo {
    id: string,
    type: CommunityReportType
}

@Injectable()
export class CommunityReportLoader extends AbstractTypeORMService<CommunityReportEntity> {
    #author: DataLoader<string, UserEntity>;
    #targetInfo: DataLoader<ITargetInfo, CommunityPostEntity | CommunityPostReplyEntity | null>;
    #files: DataLoader<string, FileEntity[]>;

    constructor(@InjectEntityManager() entityManager: EntityManager) {
        super(entityManager, CommunityReportEntity);

        this.#author = new DataLoader(
            async (ids: string[]) => {
                const reports = await this.repository.find({
                    where: { id: In(ids) },
                    relations: ["author"],
                    select: ["id", "author"],
                });

                return ids.map(id => reports.find(report => report.id === id)?.author);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );

        this.#targetInfo = new DataLoader(
            async (inputs: ITargetInfo[]) => {
                const postInputs = inputs.filter(item => item.type === CommunityReportType.POST);
                const replyInputs = inputs.filter(item => item.type === CommunityReportType.REPLT);
                const postInfos = postInputs.length > 0 ? await this.entityManager.find(CommunityPostEntity, {
                    where: {
                        id: In(postInputs.map(item => item.id))
                    }
                }) : []
                const replyInfos = replyInputs.length > 0 ? await this.entityManager.find(CommunityPostReplyEntity, {
                    where: {
                        id: In(postInputs.map(item => item.id))
                    }
                }) : []
                return inputs.map(input => input.type === CommunityReportType.POST ? postInfos.find(post => post.id === input.id) ?? null : replyInfos.find(reply => reply.id === input.id) ?? null)
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        );

        this.#files = new DataLoader(
            async (ids: string[]) => {
                const reports = await this.repository.find({
                    where: { id: In(ids) },
                    relations: ["files"],
                    select: ["id", "files"],
                });

                return ids.map(id => reports.find(report => report.id === id)?.files);
            },
            { cacheMap: new LRUCache({ max: 1000, ttl: 30000 }) },
        );
    }

    async getAuthor(id: string): Promise<UserEntity> {
        return this.#author.load(id);
    }

    async getTargetInfo(input: ITargetInfo): Promise<CommunityPostEntity | CommunityPostReplyEntity | null> {
        return this.#targetInfo.load(input);
    }

    async getFiles(id: string): Promise<FileEntity[]> {
        return this.#files.load(id);
    }
}
