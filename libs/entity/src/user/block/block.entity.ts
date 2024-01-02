/**
 * @module UserBlockModule
 */
import { Entity, ManyToOne, RelationId } from "typeorm";
import { EssentialEntity } from "@yumis-coconudge/common-module";
import { UserEntity } from "../user.entity";

/**
 * 사용자 차단 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "user_blocks", orderBy: { createdAt: "DESC", id: "ASC" } })
export class UserBlockEntity extends EssentialEntity {
  /** 차단 하는 사용자 */
  @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
  source?: UserEntity;

  /** 차단 하는 사용자 ID */
  @RelationId((block: UserBlockEntity) => block.source)
  sourceId?: string;

  /** 차단 당한 사용자 */
  @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
  destination?: UserEntity;

  /** 차단 당한 사용자 ID */
  @RelationId((block: UserBlockEntity) => block.destination)
  destinationId?: string;
}
