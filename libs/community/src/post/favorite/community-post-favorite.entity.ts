import { UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Entity, ManyToOne } from "typeorm";
import { CommunityPostEntity } from "../community-post.entity";

@Entity({ name: "community_post_favorites", orderBy: { createdAt: "DESC", id: "ASC" } })
export class CommunityPostFavoriteEntity extends DefaultEntity {
    @ManyToOne(type => UserEntity)
    user: UserEntity;

    @ManyToOne(type => CommunityPostEntity)
    post: CommunityPostEntity;
}
