/**
 * @module UserModule
 */

import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { OpenGuard } from "@app/auth/guards/open.guard";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { UserAuthService } from "@app/auth/role.auth.service";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { AuthTokenService } from "@app/auth/token/token.service";
import { UserEntity, UserRole, UserState } from "@app/entity";
import { User } from "@app/user/user.model";
import { UseGuards } from "@nestjs/common";
import { Args, GraphQLISODateTime, ID, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import dedent from "dedent";
import { UserArchiveService } from "./archive/user-archive.service";
import { UserSuspendedLogService } from "./suspended-log/suspended-log.service";
import { UserUpdateInput } from "./user.input";
import { UserLoader } from "./user.loader";
import { UserService } from "./user.service";

/**
 * 사용자 관리자용 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => User)
export class UserAdminResolver {
    constructor(
        public userService: UserService,
        public authTokenService: AuthTokenService,
        public userAuthService: UserAuthService,
        public userLoader: UserLoader,
        public userSuspendedLogService: UserSuspendedLogService,
        public userArchiveService: UserArchiveService
    ) {
        if (process.env.NODE_ENV == "production") {
            throw new Error("회원 탈퇴시 탈퇴여부 및 탈퇴 후 로직이 필요합니다."); //추가 후 삭제필요
        }
    }

    @ResolveField(_ => String, { description: "관리자용 유저 메모", nullable: true })
    @UseGuards(OpenGuard)
    async adminMemo(@Parent() user: UserEntity, @CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
        if (jwtPayload == null) return null;
        const info = await this.userLoader.getInfo(jwtPayload.id);
        if (info === undefined || info === null) {
            return null;
        } else if (info.role === UserRole.ADMIN) {
            return user.adminMemo
        } else {
            return null;
        }
    }

    //메모 업데이트
    @Mutation(_ => String, {
        description: dedent`
      특정 유저의 관리자 메모를 변경합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 없는 유저.
    `})
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateUserAdminMemo(
        @Args("id", { description: "유저 아이디", type: () => ID }) id: string,
        @Args("memo", { description: "메모 내용", type: () => String }) memo: string
    ) {
        const user = await this.userService.findOne(id);
        if (user === null) throw new NotFoundGraphQLError();
        const updatedUser = await this.userService.updateOne(id, { adminMemo: memo });
        return updatedUser.adminMemo;
    }

    @Mutation(_ => User, {
        description: dedent`
      특정 유저를 탈퇴처리합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 없는 유저.
    `})
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async leavingUser(
        @Args("id", { description: "유저 아이디", type: () => ID }) id: string,
    ) {
        const user = await this.userService.findOne(id);
        if (user === null) throw new NotFoundGraphQLError();
        //TODO: 탈퇴 가능여부 또는 탈퇴 후 처리
        const toDate = new Date();
        const expireDate = new Date();
        expireDate.setDate(toDate.getDate() + 30);
        const updatedUser = await this.userService.useTransaction(async manager => {
            const updatedUser = await this.userService.updateOne(id, { state: UserState.LEAVED, leavedAt: toDate, expireAt: expireDate }, manager);
            await this.userArchiveService.createOne({
                name: user.name,
                realname: user.realname,
                email: user.email,
                phoneNumber: user.phoneNumber
            }, manager)
            return updatedUser;
        })
        return updatedUser;
    }

    @Mutation(_ => User, {
        description: dedent`
        특정 유저를 정지처리합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 없는 유저.
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async suspendUser(
        @Args("id", { description: "유저 아이디", type: () => ID }) id: string,
        @Args("suspendedEndAt", { description: "정지 종료날", type: () => GraphQLISODateTime }) suspendedEndAt: Date,
        @Args("suspendedReason", { description: "정지 사유", nullable: true }) suspendedReason?: string
    ) {
        const user = await this.userService.findOne(id);
        if (user === null) throw new NotFoundGraphQLError();
        const updatedUser = await this.userService.updateOne(id, {
            state: UserState.SUSPENDED,
            suspendedAt: new Date(),
            suspendedEndAt: suspendedEndAt,
            suspendedReason: suspendedReason
        });
        await this.userSuspendedLogService.createOne({
            user: user,
            suspendedAt: new Date(),
            suspendedEndAt: suspendedEndAt,
            suspendedReason: suspendedReason
        })
        return updatedUser;
    }

    @Mutation(_ => User, {
        description: dedent`
        유저 정보 변경 - 관리자 권한

        **에러 코드**
      - \`NOT_FOUND\`: 없는 유저.
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateUserForAdmin(
        @Args("id", { description: "유저 아이디", type: () => ID }) id: string,
        @Args("data", { description: "변경할 유저 데이터", type: () => UserUpdateInput }) data: UserUpdateInput
    ) {
        const user = await this.userService.findOne(id);
        if (user === null) throw new NotFoundGraphQLError();
        const updatedUser = await this.userService.updateOne(id, data);
        return updatedUser;
    }
}