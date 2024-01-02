import { FileEntity, UserEntity } from "@app/entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { AbstractTypeORMService } from "@yumis-coconudge/common-module";
import DataLoader from "dataloader";
import LRUCache from "lru-cache";
import { EntityManager, In } from "typeorm";
import { InquireEntity } from "./inquire.entity";

@Injectable()
export class InquireLoader extends AbstractTypeORMService<InquireEntity> {
    #author: DataLoader<string, UserEntity>;
    #files: DataLoader<string, FileEntity[]>;

    constructor(@InjectEntityManager() entityManager: EntityManager) {
        super(entityManager, InquireEntity);

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

    async getFiles(id: string): Promise<FileEntity[]> {
        return this.#files.load(id);
    }
}
