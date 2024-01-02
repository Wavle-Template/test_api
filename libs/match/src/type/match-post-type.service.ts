import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { Repository } from "typeorm";
import { MatchPostTypeEntity } from "./match-post-type.entity";

@Injectable()
export class MatchPostTypeService extends CRUDService<MatchPostTypeEntity> {
    constructor(@InjectRepository(MatchPostTypeEntity) matchPostTypeRepositoy: Repository<MatchPostTypeEntity>) {
        super(matchPostTypeRepositoy);
    }
}