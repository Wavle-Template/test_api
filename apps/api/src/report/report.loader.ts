import { FileEntity, UserEntity } from "@app/entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { AbstractTypeORMService } from "@yumis-coconudge/common-module";
import DataLoader from "dataloader";
import LRUCache from "lru-cache";
import { EntityManager, In } from "typeorm";
import { ReportEntity } from "./report.entity";

@Injectable()
export class ReportLoader extends AbstractTypeORMService<ReportEntity> {
  #author: DataLoader<string, UserEntity>;
  #targetUser: DataLoader<string, UserEntity>;
  #files: DataLoader<string, FileEntity[]>;

  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, ReportEntity);

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

    this.#targetUser = new DataLoader(
      async (ids: string[]) => {
        const reports = await this.repository.find({
          where: { id: In(ids) },
          relations: ["targetUser"],
          select: ["id", "targetUser"],
        });

        return ids.map(id => reports.find(report => report.id === id)?.targetUser);
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

  async getTargetUser(id: string): Promise<UserEntity> {
    return this.#targetUser.load(id);
  }

  async getFiles(id: string): Promise<FileEntity[]> {
    return this.#files.load(id);
  }
}
