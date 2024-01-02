import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { Repository } from "typeorm";
import { CommunityCategoryEntity } from "./community-category.entity";

@Injectable()
export class CommunityCategoryService extends CRUDService<CommunityCategoryEntity> {
  constructor(@InjectRepository(CommunityCategoryEntity) communityRepository: Repository<CommunityCategoryEntity>) {
    super(communityRepository);
  }
}
