import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity } from "typeorm";

@Entity({ name: "match_post_types", orderBy: { createdAt: "DESC", id: "ASC" } })
export class MatchPostTypeEntity extends DefaultEntity {
    @Column()
    name: string;
}