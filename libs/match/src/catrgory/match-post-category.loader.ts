import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import { In, Repository } from "typeorm";
import { MatchPostCategoryEntity } from "./match-post-category.entity";


@Injectable()
export class MatchPostCategoryBasicLoader {
    #matchCategoryRepository: Repository<MatchPostCategoryEntity>;
    #dataloader: DataLoader<string, MatchPostCategoryEntity>;

    constructor(@InjectRepository(MatchPostCategoryEntity) matchCategoryRepository: Repository<MatchPostCategoryEntity>) {
        this.#matchCategoryRepository = matchCategoryRepository;
        this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
    }
    async batch(keys: string[]): Promise<MatchPostCategoryEntity[]> {
        const categories = await this.#matchCategoryRepository.find({
            where: { id: In(keys) }
        });
        return keys.map(key => categories.find(category => category.id === key));
    }

    async get(id: string): Promise<MatchPostCategoryEntity> {
        return await this.#dataloader.load(id);
    }
}