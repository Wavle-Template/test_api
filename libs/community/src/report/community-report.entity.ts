import { FileEntity, UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, JoinTable, ManyToMany, ManyToOne, OneToMany, RelationId } from "typeorm";
import { CommunityReportState, CommunityReportType } from "./community-report.enum";

@Entity({ name: "community_reports", orderBy: { createdAt: "DESC", id: "ASC" } })
export class CommunityReportEntity extends DefaultEntity {

    /**신고자 */
    @RelationId((reply: CommunityReportEntity) => reply.author)
    authorId: string;

    @ManyToOne(type => UserEntity)
    author: UserEntity;

    /** 타겟 ID(Post or Reply) */
    @Column({ type: "uuid" })
    targetId: string;

    /** 신고내용 */
    @Column()
    content: string;

    /** 신고 종류 */
    @Column({ nullable: true })
    category: string;

    /** 기타 예비용 컬럼 */
    @Column({ nullable: true })
    etc?: string;

    /** 관리자 메모 */
    @Column({ nullable: true })
    adminMemo?: string;

    /** 타입 */
    @Column({ default: CommunityReportType.POST })
    type: string;

    /** 상태 */
    @Column({ default: CommunityReportState.PENDING })
    state: string;

    /** 참고 이미지 */
    @ManyToMany(type => FileEntity, { nullable: true, onDelete: "SET NULL" })
    @JoinTable()
    files?: FileEntity[];

}
