import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import { In, Repository } from "typeorm";
import { CommunityPostFavoriteEntity } from "./community-post-favorite.entity";

interface IKey {
    userId: string;
    communityPostId: string;
}

@Injectable()
export class CommunityPostFavoriteBasicLoader {
    #communityPostFavoriteRepository: Repository<CommunityPostFavoriteEntity>;
    #dataloader: DataLoader<IKey, CommunityPostFavoriteEntity>;

    constructor(
        @InjectRepository(CommunityPostFavoriteEntity)
        communityPostFavoriteRepository: Repository<CommunityPostFavoriteEntity>
    ) {
        this.#communityPostFavoriteRepository = communityPostFavoriteRepository;
        this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
    }

    async batch(keys: IKey[]): Promise<CommunityPostFavoriteEntity[]> {
        const communityPostFavorites = await this.#communityPostFavoriteRepository.find({
            where: {
                user: { id: In(keys.map(value => value.userId)) },
                post: { id: In(keys.map(value => value.communityPostId)) }
            },
            relations: ["user", "post"],
            order: { createdAt: "ASC" }
        });
        return keys.map(key =>
            communityPostFavorites.find(
                favorite => favorite.user.id === key.userId && favorite.post.id === key.communityPostId
            )
        );
    }

    async get(args: IKey): Promise<CommunityPostFavoriteEntity> {
        const communityPostFavorite = await this.#dataloader.load(args);
        return communityPostFavorite;
    }
}

@Injectable()
export class CommunityPostByAuthorForFavoriteCountLoader {
    #dataloader: DataLoader<string, number>;
    #communityPostRepository: Repository<CommunityPostFavoriteEntity>;

    constructor(@InjectRepository(CommunityPostFavoriteEntity) communityPostRepository: Repository<CommunityPostFavoriteEntity>) {
        this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
        this.#communityPostRepository = communityPostRepository;
    }

    async batch(keys: string[]): Promise<number[]> {
        const favorites: { userId: string, cnt: number }[] = keys.length > 0 ? await this.#communityPostRepository.createQueryBuilder("postFavorite")
            .select(`postFavorite."userId"`, "userId")
            .addSelect(`count(*)`, "cnt")
            .where(`postFavorite."userId" in (...ids)`, { ids: keys })
            .groupBy(`postFavorite."userId"`)
            .getRawMany()
            : [];

        return keys.map(key =>
            favorites.find(item => item.userId === key).cnt ?? 0
        );
    }

    async get(userId: string): Promise<number> {
        return await this.#dataloader.load(userId);
    }
}