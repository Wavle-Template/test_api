import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { DeepPartial } from "ts-essentials";
import { EntityManager } from "typeorm";
import { AdminPostCategoryEntity } from "./category.entity";

@Injectable()
export class AdminPostCategoryService extends CRUDService<AdminPostCategoryEntity> {
  #cache: AdminPostCategoryEntity[] | null = null;
  #expiresAt: number | null = null;

  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, AdminPostCategoryEntity);
  }

  async getAll(): Promise<AdminPostCategoryEntity[]> {
    if (this.#cache !== null && this.#expiresAt > Date.now()) {
      return this.#cache;
    }

    const categories = await this.repository.find();
    this.#cache = categories;
    this.#expiresAt = Date.now() + 60000;

    return categories;
  }

  async createOne(
    data: DeepPartial<AdminPostCategoryEntity>,
    transactionManager?: EntityManager,
  ): Promise<AdminPostCategoryEntity> {
    this.#cache = null;
    this.#expiresAt = null;
    return super.createOne(data, transactionManager);
  }

  async createMany(
    datas: DeepPartial<AdminPostCategoryEntity>[],
    transactionManager?: EntityManager,
  ): Promise<AdminPostCategoryEntity[]> {
    this.#cache = null;
    this.#expiresAt = null;
    return super.createMany(datas, transactionManager);
  }

  async updateOne(
    id: string,
    data: DeepPartial<AdminPostCategoryEntity>,
    transactionManager?: EntityManager,
  ): Promise<AdminPostCategoryEntity> {
    this.#cache = null;
    this.#expiresAt = null;
    return super.updateOne(id, data, transactionManager);
  }

  async updateMany(
    ids: string[],
    data: DeepPartial<AdminPostCategoryEntity>,
    transactionManager?: EntityManager,
  ): Promise<AdminPostCategoryEntity[]> {
    this.#cache = null;
    this.#expiresAt = null;
    return super.updateMany(ids, data, transactionManager);
  }

  async updateMultiple(
    map: Record<string | number, DeepPartial<AdminPostCategoryEntity>>,
    transactionManager?: EntityManager,
  ): Promise<AdminPostCategoryEntity[]> {
    this.#cache = null;
    this.#expiresAt = null;
    return super.updateMultiple(map, transactionManager);
  }
}
