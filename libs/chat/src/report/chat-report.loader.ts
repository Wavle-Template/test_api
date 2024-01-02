import { ChatChannelEntity, ChatMessageEntity, ChatReportType } from "@app/common-chat-res";
import { FileEntity, UserEntity } from "@app/entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { AbstractTypeORMService } from "@yumis-coconudge/common-module";
import DataLoader from "dataloader";
import LRUCache from "lru-cache";
import { EntityManager, In } from "typeorm";
import { ChatReportEntity } from "./chat-report.entity";

interface ITargetInfo {
    id: string,
    type: ChatReportType
}

@Injectable()
export class ChatReportLoader extends AbstractTypeORMService<ChatReportEntity> {
    #author: DataLoader<string, UserEntity>;
    #targetInfo: DataLoader<ITargetInfo, ChatChannelEntity | ChatMessageEntity | null>;
    #files: DataLoader<string, FileEntity[]>;

    constructor(@InjectEntityManager() entityManager: EntityManager) {
        super(entityManager, ChatReportEntity);

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
                const channelInputs = inputs.filter(item => item.type === ChatReportType.CHANNEL);
                const messageInputs = inputs.filter(item => item.type === ChatReportType.MESSAGE);
                const channelInfos = channelInputs.length > 0 ? await this.entityManager.find(ChatChannelEntity, {
                    where: {
                        id: In(channelInputs.map(item => item.id))
                    }
                }) : []
                const messageInfos = messageInputs.length > 0 ? await this.entityManager.find(ChatMessageEntity, {
                    where: {
                        id: In(channelInputs.map(item => item.id))
                    }
                }) : []
                return inputs.map(input => input.type === ChatReportType.CHANNEL ? channelInfos.find(post => post.id === input.id) ?? null : messageInfos.find(reply => reply.id === input.id) ?? null)
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

    async getTargetInfo(input: ITargetInfo): Promise<ChatChannelEntity | ChatMessageEntity | null> {
        return this.#targetInfo.load(input);
    }

    async getFiles(id: string): Promise<FileEntity[]> {
        return this.#files.load(id);
    }
}
