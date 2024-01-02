import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, OneToMany } from "typeorm";
import { AdminPostEntity } from "../admin-post.entity";

@Entity({ name: "admin_post_cateogries", orderBy: { priority: "ASC", name: "ASC", createdAt: "DESC", id: "ASC" } })
export class AdminPostCategoryEntity extends DefaultEntity {
  @Column({ nullable: true })
  type: string;

  @Column({ nullable: true })
  name: string;

  @Column({ default: true })
  isVisible: boolean;

  @Column("int", { default: 0 })
  priority: number;

  @OneToMany(type => AdminPostEntity, post => post.category, { nullable: true, onDelete: "SET NULL" })
  posts?: AdminPostEntity[];
}
