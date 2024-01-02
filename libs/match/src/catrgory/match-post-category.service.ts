import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { Repository } from "typeorm";
import { MatchPostCategoryEntity } from "./match-post-category.entity";

@Injectable()
export class MatchPostCategoryService extends CRUDService<MatchPostCategoryEntity> {
    constructor(@InjectRepository(MatchPostCategoryEntity) matchCategoryRepository: Repository<MatchPostCategoryEntity>) {
        super(matchCategoryRepository);
    }
}