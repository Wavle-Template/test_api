/**
 * @module UserModule
 */
import { DefaultEntity } from "@yumis-coconudge/common-module";
import {
    Column,
    Entity,
    PrimaryGeneratedColumn,
} from "typeorm";
/**
 * 사용자 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "user_archives", orderBy: { joinedAt: "DESC", id: "ASC" } })
export class UserArchiveEntity extends DefaultEntity {
    
    /** 고유 이름(아이디) */
    @Column({ nullable: true })
    name?: string;

    /** 실명 */
    @Column({ nullable: true })
    realname?: string;

    /** 이메일 */
    @Column({ nullable: true })
    email?: string;

    /** 전화번호 */
    @Column({ nullable: true })
    phoneNumber?: string;

}
