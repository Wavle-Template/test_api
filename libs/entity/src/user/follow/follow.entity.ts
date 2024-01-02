/**
 * @module UserFollowModule
 */
import { EssentialEntity } from "@yumis-coconudge/common-module";
import { Entity, ManyToOne, RelationId } from "typeorm";
import { UserEntity } from "../user.entity";

/**
 * 사용자 팔로우 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "user_follows", orderBy: { createdAt: "DESC", id: "ASC" } })
export class UserFollowEntity extends EssentialEntity {
  /** 팔로우 하는 사용자 */
  @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
  source?: UserEntity;

  /** 팔로우 하는 사용자 ID */
  @RelationId((follow: UserFollowEntity) => follow.source)
  sourceId?: string;

  /** 팔로우 당한 사용자 */
  @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
  destination?: UserEntity;

  /** 팔로우 당한 사용자 ID */
  @RelationId((follow: UserFollowEntity) => follow.destination)
  destinationId?: string;
}
