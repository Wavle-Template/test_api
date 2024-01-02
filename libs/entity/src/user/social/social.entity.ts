/**
 * @module UserSocialModule
 */
import { EssentialEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, Index, ManyToOne, RelationId } from "typeorm";
import { UserEntity } from "../user.entity";

/**
 * 사용자 소셜 엔티티
 * @category TypeORM Entity
 */
@Entity("user_socials")
export class UserSocialEntity extends EssentialEntity {
  /** 사용자 */
  @ManyToOne(type => UserEntity, user => user.socials, { nullable: true, onDelete: "SET NULL" })
  user?: UserEntity;

  /** 사용자 ID */
  @RelationId((social: UserSocialEntity) => social.user)
  userId?: string;

  /** 소셜 종류 */
  @Column({ nullable: true })
  socialType?: string;

  /** 소셜 ID */
  @Column({ nullable: true })
  @Index()
  socialId?: string;

  /** 이메일 */
  @Column({ nullable: true })
  email?: string;
}
