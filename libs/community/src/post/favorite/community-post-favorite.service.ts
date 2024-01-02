import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { Repository } from "typeorm";
import { CommunityPostFavoriteEntity } from "./community-post-favorite.entity";

@Injectable()
export class CommunityPostFavoriteService extends CRUDService<CommunityPostFavoriteEntity> {
    constructor(
        @InjectRepository(CommunityPostFavoriteEntity)
        communityPostRepository: Repository<CommunityPostFavoriteEntity>
    ) {
        super(communityPostRepository);
    }

    async find(postId: string, userId: string) {
        return await this.repository.find({
            where: {
                post: { id: postId }, user: { id: userId }
            },
            relations: ["post", "user"]
        })
    }
}
