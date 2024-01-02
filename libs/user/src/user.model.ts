import { UserEntity, UserRole, UserState } from "@app/entity";
import { Field, GraphQLISODateTime, ID, Int, InterfaceType, ObjectType } from "@nestjs/graphql";
import { UserNotificationSetting } from "@app/user/notification-setting/notification-setting.model";
import { UserProfile } from "@app/user/profile/profile.model";

/**
 * 사용자 (인터페이스))
 * @category GraphQL Object Type
 */
@InterfaceType({
    description: "사용자",
    resolveType: (user: UserEntity) => {
        switch (user.role) {
            case UserRole.ADMIN:
                return Admin;
            case UserRole.MEMBER:
                return Member;
            default:
                return User;
        }
    },
})
export class User {
    /** UUID */
    @Field(type => ID, { description: "UUID" })
    id: string;

    /** 고유번호 */
    @Field(type => Int, { description: "고유번호" })
    idx: number;

    /** 권한 타입 */
    @Field(type => UserRole, { description: "권한 타입" })
    role?: string;

    /** 권한 타입 */
    @Field(type => UserState, { description: "상태" })
    state?: string;

    /** 고유 이름(아이디) */
    @Field(type => String, { nullable: true, description: "고유 이름(아이디)" })
    name?: string;

    /** 실명 */
    @Field(type => String, { nullable: true, description: "실명" })
    realname?: string;

    /** 닉네임 */
    @Field(type => String, { nullable: true, description: "닉네임" })
    nickname?: string;

    /** 이메일 */
    @Field(type => String, { nullable: true, description: "이메일" })
    email?: string;

    /** 전화번호 */
    @Field(type => String, { nullable: true, description: "전화번호" })
    phoneNumber?: string;

    /** 가입 날짜/시간 */
    @Field(type => GraphQLISODateTime, { description: "가입 날짜/시간" })
    joinedAt: Date;

    /** 탈퇴 날짜/시간 */
    @Field(type => GraphQLISODateTime, { nullable: true, description: "탈퇴 날짜/시간" })
    leavedAt?: Date;

    /** 정지 처리된 날 */
    @Field(type => GraphQLISODateTime, { nullable: true, description: "정지 처리된 시간" })
    suspendedAt?: Date;

    // /** 정지 종료 날 */
    // @Field(type => GraphQLISODateTime, { nullable: true, description: "정지 종료 날" })
    // suspendedEndAt?: Date;

    // /** 정지 사유 */
    // @Field(type => String, { nullable: true, description: "정지 사유" })
    // suspendedReason?: string;
}

/**
 * 일반 사용자
 * @category GraphQL Object Type
 */
@ObjectType({ description: "일반 사용자", implements: () => [User] })
export class Member extends User {
    /** 프로필 */
    @Field(type => UserProfile, { description: "프로필" })
    profile: UserProfile;

    /** 알림 설정 */
    @Field(type => UserNotificationSetting, { description: "알림 설정" })
    notificationSetting: UserNotificationSetting;
}

/**
 * 관리자
 * @category GraphQL Object Type
 */
@ObjectType({ description: "관리자", implements: () => [User] })
export class Admin extends User { }