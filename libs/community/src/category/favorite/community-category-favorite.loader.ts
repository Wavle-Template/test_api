import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import { In, Repository } from "typeorm";
import { CommunityCategoryFavoriteEntity } from "./community-category-favorite.entity";

interface IKey {
  userId: string;
  communityCategoryId: string;
}

@Injectable()
export class CommunityCategoryFavoriteByUserIdLoader {
  #communityCategoryFavoriteRepository: Repository<CommunityCategoryFavoriteEntity>;
  #dataloader: DataLoader<IKey, CommunityCategoryFavoriteEntity>;

  constructor(
    @InjectRepository(CommunityCategoryFavoriteEntity)
    communityCategoryFavoriteRepository: Repository<CommunityCategoryFavoriteEntity>
  ) {
    this.#communityCategoryFavoriteRepository = communityCategoryFavoriteRepository;
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
  }

  async batch(keys: IKey[]): Promise<CommunityCategoryFavoriteEntity[]> {
    const communityCategoryFavorites = await this.#communityCategoryFavoriteRepository.find({
      where: {
        user: { id: In(keys.map(value => value.userId)) },
        communityCategory: { id: In(keys.map(value => value.communityCategoryId)) }
      },
      relations: ["user", "communityCategory"],
      order: { createdAt: "ASC" }
    });
    return keys.map(key =>
      communityCategoryFavorites.find(
        favorite => favorite.user.id === key.userId && favorite.communityCategory.id === key.communityCategoryId
      )
    );
  }

  async get(args: IKey): Promise<CommunityCategoryFavoriteEntity> {
    const communityCategoryFavorite = await this.#dataloader.load(args);
    return communityCategoryFavorite;
  }
}
