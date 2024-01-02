import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import { In, Repository } from "typeorm";
import { MatchPostTypeEntity } from "./match-post-type.entity";

@Injectable()
export class MatchPostTypeBasicLoader {
    #matchPostTypeRepository: Repository<MatchPostTypeEntity>;
    #dataloader: DataLoader<string, MatchPostTypeEntity>;
    constructor(@InjectRepository(MatchPostTypeEntity) matchPostTypeRepository: Repository<MatchPostTypeEntity>) {
        this.#matchPostTypeRepository = matchPostTypeRepository;
        this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
    }
    async batch(keys: string[]): Promise<MatchPostTypeEntity[]> {
        const types = await this.#matchPostTypeRepository.find({
            where: { id: In(keys) }
        });
        return keys.map(key => types.find(type => type.id === key));
    }

    async get(id: string): Promise<MatchPostTypeEntity> {
        return await this.#dataloader.load(id);
    }
}