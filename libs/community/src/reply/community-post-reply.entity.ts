import { UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from "typeorm";
import { CommunityPostEntity } from "../post/community-post.entity";

@Entity({ name: "community_post_replies", orderBy: { createdAt: "DESC", id: "ASC" } })
export class CommunityPostReplyEntity extends DefaultEntity {
  @RelationId((reply: CommunityPostReplyEntity) => reply.post)
  postId?: string;

  @ManyToOne(type => CommunityPostEntity, { nullable: true, onDelete: "SET NULL" })
  post?: CommunityPostEntity;

  @RelationId((reply: CommunityPostReplyEntity) => reply.author)
  authorId: string;

  @ManyToOne(type => UserEntity)
  author: UserEntity;

  @RelationId((reply: CommunityPostReplyEntity) => reply.parent)
  parentId?: string;

  @ManyToOne(type => CommunityPostReplyEntity, { nullable: true, onDelete: "SET NULL" })
  parent?: CommunityPostReplyEntity;

  @OneToMany(type => CommunityPostReplyEntity, reply => reply.parent)
  replies: CommunityPostReplyEntity[];

  @Column()
  content: string;

  @Column("int", { default: 0 })
  likeCount: number;

  @ManyToMany(() => UserEntity)
  @JoinTable()
  likes: UserEntity[];

  @ManyToMany(() => UserEntity, { nullable: true })
  @JoinTable()
  usertags?: UserEntity[];
}
