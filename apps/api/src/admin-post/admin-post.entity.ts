import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { AdminPostAction, AdminPostState } from "./admin-post.enum";
import { AdminPostCategoryEntity } from "./category/category.entity";

@Entity({ name: "admin_posts", orderBy: { priority: "ASC", createdAt: "DESC", id: "ASC" } })
export class AdminPostEntity extends DefaultEntity {
  @Column({ nullable: true })
  type: string;

  @Column({ default: AdminPostState.ACTIVE })
  state: string;

  @Column({ default: AdminPostAction.TEXT })
  action: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  coverUrl?: string;

  @Column("int", { default: 0 })
  priority: number;

  @Column("timestamptz", { default: "1990-01-01 00:00:00.000 +0900" })
  publishingPeriodStartAt: Date;

  @Column("timestamptz", { default: "2999-12-31 23:59:59.000 +0900" })
  publishingPeriodEndAt: Date;

  @Column({ nullable: true })
  linkUrl?: string

  @ManyToOne(type => AdminPostCategoryEntity, { nullable: true, onDelete: "SET NULL" })
  category?: AdminPostCategoryEntity;

  @RelationId((post: AdminPostEntity) => post.category)
  categoryId?: string;

}
