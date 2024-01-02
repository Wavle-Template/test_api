/**
 * @module UserModule
 */
import { Column, JoinTable, ManyToMany } from "typeorm";
import { UserEntity } from "../user.entity";

/**
 * 사용자 프로필 엔티티
 * @category TypeORM Entity
 */
export class UserProfileEntity {
  /** 프로필 설명 */
  @Column({ nullable: true })
  description?: string;

  /** 홈페이지 등 링크 */
  @Column({ nullable: true })
  url?: string;

  /** 유저 태그 (멘션) */
  @ManyToMany(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinTable()
  usertags?: UserEntity[];
}
