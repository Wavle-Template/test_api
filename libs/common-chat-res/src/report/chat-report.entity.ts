import { FileEntity, UserEntity } from "@app/entity";
import { DefaultEntity } from "@yumis-coconudge/common-module";
import { Column, JoinTable, ManyToMany, ManyToOne, RelationId } from "typeorm";
import { ChatReportState, ChatReportType } from "./chat-report.enum";

export abstract class ChatReportBaseEntity extends DefaultEntity {

    /**신고자 */
    @RelationId((reply: ChatReportBaseEntity) => reply.author)
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
    @Column({ default: ChatReportType.MESSAGE })
    type: string;

    /** 상태 */
    @Column({ default: ChatReportState.PENDING })
    state: string;

    /** 참고 이미지 */
    @ManyToMany(type => FileEntity, { nullable: true, onDelete: "SET NULL" })
    @JoinTable()
    files?: FileEntity[];

}
