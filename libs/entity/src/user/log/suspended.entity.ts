import { EssentialEntity } from "@yumis-coconudge/common-module";
import { Column, Entity, ManyToOne, RelationId } from "typeorm";
import { UserEntity } from "../user.entity";

/**
 * 사용자 정지 로그
 * @category TypeORM Entity
 */
@Entity({ name: "user_suspended_log", orderBy: { createdAt: "DESC", id: "ASC" } })
export class UserSuspenedLogEntity extends EssentialEntity {
    /** 사용자 */
    @ManyToOne(type => UserEntity, { nullable: true, onDelete: "SET NULL" })
    user?: UserEntity;

    /** 사용자 ID */
    @RelationId((follow: UserSuspenedLogEntity) => follow.user)
    userId?: string;

    /** 정지 처리된 날 */
    @Column("timestamptz", { nullable: true })
    suspendedAt?: Date;

    /** 정지 종료 날 */
    @Column("timestamptz", { nullable: true })
    suspendedEndAt?: Date;

    /** 정지 사유 */
    @Column({ nullable: true })
    suspendedReason?: string;

}
