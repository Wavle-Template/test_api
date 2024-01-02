import { FileEntity, UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne } from "typeorm";
import { InquireState, InquireType } from "./inquire.enum";


@Entity({ name: "inquires", orderBy: { priority: "ASC", createdAt: "DESC", id: "ASC" } })
export class InquireEntity extends DefaultEntity {

    /** 작성자 */
    @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
    author?: UserEntity;

    @Column({ default: InquireType.COMMON })
    type?: string

    /** 제목 */
    @Column({ nullable: true })
    title?: string

    /** 내용 */
    @Column()
    content: string

    /** 상태 */
    @Column({ default: InquireState.ACTIVE })
    state?: string

    /** 답변 */
    @Column({ nullable: true })
    answerContent?: string

    @Column("timestamptz", { nullable: true })
    answereddAt?: Date;

    /** 관리자 메모 */
    @Column({ nullable: true })
    adminMemo: string;

    @ManyToMany(type => FileEntity, { nullable: true, onDelete: "SET NULL" })
    @JoinTable()
    files?: FileEntity[];

}