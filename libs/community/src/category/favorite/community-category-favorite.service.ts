import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { Repository } from "typeorm";
import { CommunityCategoryFavoriteEntity } from "./community-category-favorite.entity";

@Injectable()
export class CommunityCategoryFavoriteService extends CRUDService<CommunityCategoryFavoriteEntity> {
  constructor(
    @InjectRepository(CommunityCategoryFavoriteEntity)
    communityFavoriteRepository: Repository<CommunityCategoryFavoriteEntity>
  ) {
    super(communityFavoriteRepository);
  }

  async find(communityCategoryId: string, userId: string) {
    return await this.repository.find({
      where: {
        communityCategory: { id: communityCategoryId }, user: { id: userId }
      },
      relations: ["communityCategory", "user"]
    })
  }
}
