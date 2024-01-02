/**
 * @module UserModule
 */
import {
    Column,
    Entity,
    ManyToOne,
    PrimaryGeneratedColumn,
    RelationId,
} from "typeorm";
import { UserEntity } from "../user.entity";

/**
 * 휴면 사용자 엔티티
 * @category TypeORM Entity
 */
@Entity({ name: "sleepers", orderBy: { joinedAt: "DESC", id: "ASC" } })
export class SleeperEntity {
    /** UUID */
    @PrimaryGeneratedColumn("uuid")
    id: string;
    
    /** 암호화용 솔트 */
    @Column({ nullable: true, select: false })
    salt?: string;

    /** 고유 이름(아이디) */
    @Column({ nullable: true })
    name?: string;

    /** 실명 */
    @Column({ nullable: true })
    realname?: string;

    /** 닉네임 */
    @Column({ nullable: true })
    nickname?: string;

    /** 비밀번호 */
    @Column({ nullable: true, select: false })
    password?: string;

    /** 이메일 */
    @Column({ nullable: true })
    email?: string;

    /** 전화번호 */
    @Column({ nullable: true })
    phoneNumber?: string;

    /** 사용자 */
    @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
    user?: UserEntity;

    /** 사용자 ID */
    @RelationId((sleeper: SleeperEntity) => sleeper.user)
    userId?: string;

}
