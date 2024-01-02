import { FileEntity, UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { CommunityCategoryEntity } from "../category/community-category.entity";

@Entity({ name: "community_posts", orderBy: { createdAt: "DESC", id: "ASC" } })
export class CommunityPostEntity extends DefaultEntity {
  @Column({ nullable: true })
  title?: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  addressName?: string;

  @Column({ nullable: true })
  addressDetail?: string;

  @Column("int", { default: 0 })
  viewCount: number;

  @Column("int", { default: 0 })
  likeCount: number;

  @Column("int", { default: 0 })
  replyCount: number;

  @Column("int", { default: 0 })
  hideCount: number;

  @Column("boolean", { default: true })
  isVisible: boolean;

  @RelationId((post: CommunityPostEntity) => post.author)
  authorId: string;

  @ManyToOne(type => UserEntity)
  author: UserEntity;

  @RelationId((post: CommunityPostEntity) => post.category)
  categoryId?: string;

  @ManyToOne(type => CommunityCategoryEntity, { nullable: true })
  category?: CommunityCategoryEntity;

  @ManyToMany(() => FileEntity)
  @JoinTable()
  files: FileEntity[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
  likes: UserEntity[];

  @ManyToMany(() => UserEntity)
  @JoinTable()
  views: UserEntity[];

  @Column({ type: "text", array: true })
  hashtags: string[];

  @ManyToMany(() => UserEntity, { nullable: true })
  @JoinTable()
  usertags?: UserEntity[];

  @Column({ nullable: true })
  deepLinkUrl?: string;

  /** 게시글 상단 고정 여부 */
  @Column({ default: false })
  isPinned: boolean;

  /** 게시글 상단 고정한 시간 */
  @Column({ nullable: true })
  pinnedAt?: Date;

  /** 해당 게시글을 숨긴 사용자들 */
  @ManyToMany(() => UserEntity)
  @JoinTable()
  hide: UserEntity[];

}
