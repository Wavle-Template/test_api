/**
 * @module HashtagModule
 */
import { EssentialEntity } from "@yumis-coconudge/common-module";
import { Column, Entity } from "typeorm";

/**
 * 해시태그 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "hashtags", orderBy: { createdAt: "DESC", id: "ASC" } })
export class HashtagEntity extends EssentialEntity {
  /** 키워드 */
  @Column({ unique: true })
  keyword: string;
}
