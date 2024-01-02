import { FileEntity, UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { ReportState } from "./report.enum";

@Entity({ name: "reports", orderBy: { createdAt: "DESC", id: "ASC" } })
export class ReportEntity extends DefaultEntity {
  @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
  author: UserEntity;

  @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
  targetUser: UserEntity;

  @Column({ nullable: true })
  category: string;

  @Column()
  content: string;

  @Column({ nullable: true })
  etc?: string;

  @Column({ nullable: true })
  adminMemo?: string;

  @Column({ default: ReportState.PENDING })
  state: string;

  @ManyToMany(type => FileEntity, { nullable: true, onDelete: "SET NULL" })
  @JoinTable()
  files?: FileEntity[];
}
