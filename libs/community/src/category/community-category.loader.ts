import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import { In, Repository } from "typeorm";
import { CommunityCategoryEntity } from "./community-category.entity";

@Injectable()
export class CommunityCategoryBasicLoader {
  #communityCategoryRepository: Repository<CommunityCategoryEntity>;
  #dataloader: DataLoader<string, CommunityCategoryEntity>;
  constructor(
    @InjectRepository(CommunityCategoryEntity) communityCategoryRepository: Repository<CommunityCategoryEntity>
  ) {
    this.#communityCategoryRepository = communityCategoryRepository;
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
  }
  async batch(keys: string[]): Promise<CommunityCategoryEntity[]> {
    const categories = await this.#communityCategoryRepository.find({
      where: { id: In(keys) }
    });
    return keys.map(key => categories.find(category => category.id === key));
  }

  async get(id: string): Promise<CommunityCategoryEntity> {
    return await this.#dataloader.load(id);
  }
}
