import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity } from "typeorm";

@Entity({ name: "match_post_categories", orderBy: { priority: "ASC", createdAt: "DESC", id: "ASC" } })
export class MatchPostCategoryEntity extends DefaultEntity {
    @Column()
    name: string;

    @Column("int", { default: 1 })
    priority: number;
}