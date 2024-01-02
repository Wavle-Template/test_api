import { UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { MatchPostEntity } from "../post/match-post.entity";
import { MatchPostLogStateEnum } from "./match-post-log.enum";

@Entity({ name: "match_post_logs", orderBy: { priority: "ASC", createdAt: "DESC", id: "ASC" } })
export class MatchPostLogEntity extends DefaultEntity {
    /** 작성자 */
    @RelationId((post: MatchPostEntity) => post.author)
    authorId: string;

    /** 작성자 */
    @ManyToOne(type => UserEntity)
    author: UserEntity;

    /** 매칭된 사용자 */
    @RelationId((post: MatchPostEntity) => post.trader)
    traderId?: string;

    /** 매칭된 사용자 */
    @ManyToOne(type => UserEntity, { nullable: true })
    trader?: UserEntity;

    /** 매칭 데이터 */
    @RelationId((post: MatchPostLogEntity) => post.matchPost)
    matchPostId?: string;

    /** 매칭 데이터 */
    @ManyToOne(type => MatchPostEntity, { nullable: true })
    matchPost?: MatchPostEntity;
    

    @Column("enum", { enum: MatchPostLogStateEnum, default: MatchPostLogStateEnum.MATCHED })
    state: MatchPostLogStateEnum;
}