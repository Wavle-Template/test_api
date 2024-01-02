import { FileEntity, UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { MatchPostCategoryEntity } from "../catrgory/match-post-category.entity";
import { MatchPostTypeEntity } from "../type/match-post-type.entity";
import { MatchPostStateEnum } from "./match-post.enum";

@Entity({ name: "match_posts", orderBy: { createdAt: "DESC", id: "ASC" } })
export class MatchPostEntity extends DefaultEntity {
    @RelationId((post: MatchPostEntity) => post.category)
    categoryId?: string;

    @ManyToOne(type => MatchPostCategoryEntity, { nullable: true })
    category?: MatchPostCategoryEntity;

    @Column({ nullable: true })
    title?: string;

    @Column("jsonb", { nullable: true })
    detail?: Record<string, unknown>;

    @Column({ nullable: true })
    description: string;

    @Column({ nullable: true })
    addressName?: string;

    @Column({ nullable: true })
    addressSiDo?: string;

    @Column({ nullable: true })
    addressSiGunGu?: string;

    @Column({ nullable: true })
    addressDetail?: string;

    @Column("int", { default: 0 })
    viewCount: number;

    @Column("int", { default: 0 })
    likeCount: number;

    @Column("int", { default: 0 })
    replyCount: number;

    @Column("boolean", { default: true })
    isVisible: boolean;

    @Column("enum", { enum: MatchPostStateEnum, default: MatchPostStateEnum.IN_PROGRESS })
    state: MatchPostStateEnum;

    @RelationId((post: MatchPostEntity) => post.author)
    authorId: string;

    @ManyToOne(type => UserEntity)
    author: UserEntity;

    @RelationId((post: MatchPostEntity) => post.trader)
    traderId?: string;

    @ManyToOne(type => UserEntity, { nullable: true })
    trader?: UserEntity;

    @ManyToMany(() => FileEntity)
    @JoinTable()
    files: FileEntity[];

    @ManyToMany(() => UserEntity)
    @JoinTable({ name:"match_post_likes"})
    likes: UserEntity[];

    // @ManyToMany(() => HashtagEntity, { nullable: true })
    // @JoinTable()
    // hashtags?: HashtagEntity[];

    @ManyToMany(() => UserEntity, { nullable: true })
    @JoinTable()
    usertags?: UserEntity[];

    @RelationId((post: MatchPostEntity) => post.type)
    typeId?: string;

    @ManyToOne(() => MatchPostTypeEntity, { nullable: true, onDelete: "SET NULL" })
    type?: MatchPostTypeEntity;

    // @OneToMany(type => ChatChannelEntity, channel => channel.matchPost)
    // channels: ChatChannelEntity[];

    /** deeplink url */
    @Column({ nullable: true })
    deepLinkUrl?: string;
}