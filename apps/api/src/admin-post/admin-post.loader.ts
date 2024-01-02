import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { AbstractTypeORMService } from "@yumis-coconudge/common-module";
import DataLoader from "dataloader";
import LRUCache from "lru-cache";
import { EntityManager, In } from "typeorm";
import { AdminPostEntity } from "./admin-post.entity";
import { AdminPostCategoryEntity } from "./category/category.entity";

@Injectable()
export class AdminPostLoader extends AbstractTypeORMService<AdminPostEntity> {
  #category: DataLoader<string, AdminPostCategoryEntity>;

  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, AdminPostEntity);

    this.#category = new DataLoader(
      async (ids: string[]) => {
        const posts = await this.repository.find({
          where: { id: In(ids) },
          relations: ["category"],
          select: ["id", "category"],
        });

        return ids.map(id => posts.find(post => post.id === id)?.category);
      },
      { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
    );
  }

  async getCategory(id: string): Promise<AdminPostCategoryEntity> {
    return this.#category.load(id);
  }
}
