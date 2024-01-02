import { UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Entity, ManyToOne } from "typeorm";
import { CommunityCategoryEntity } from "../community-category.entity";

@Entity({ name: "community_category_favorites", orderBy: { createdAt: "DESC", id: "ASC" } })
export class CommunityCategoryFavoriteEntity extends DefaultEntity {
  @ManyToOne(type => UserEntity)
  user: UserEntity;

  @ManyToOne(type => CommunityCategoryEntity)
  communityCategory: CommunityCategoryEntity;
}
