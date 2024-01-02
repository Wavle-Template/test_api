import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity } from "typeorm";

@Entity({ name: "community_categories", orderBy: { createdAt: "DESC", id: "ASC" } })
export class CommunityCategoryEntity extends DefaultEntity {
  @Column()
  name: string;

  @Column("int", { default: 1 })
  priority: number;
}
