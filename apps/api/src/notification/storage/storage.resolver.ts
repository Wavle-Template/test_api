/**
 * @module NotificationStorageModule
 */
import { forwardRef, Inject, UseGuards } from '@nestjs/common';
import { Args, ID, Info, Mutation, Query, Resolver } from '@nestjs/graphql';
import { BadRequestGraphQLError, NotFoundGraphQLError } from '@yumis-coconudge/common-module';
import dedent from 'dedent';
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from 'graphql';
import { UserRole } from '@app/entity';
import { NotificationStorageArgs } from './storage.args';
import { NotificationStorageList, NotificationStorageModel } from './storage.model';
import { NotificationStorageService } from './storage.service';
import { ApolloError } from 'apollo-server-fastify';
import { Edge } from '@yumis-coconudge/typeorm-helper';
import { NotificationStorageEntity } from './storage.entity';
import { NotificationStorageCreateInput, NotificationStorageUpdateInput } from './storage.input';
import { NotificationStorageTargetType } from './storage.enum';
import { NotificationService } from '../notification.service';
import { JwtGuard } from '@app/auth/guards/jwt.guard';
import { UserRoleGuard } from '@app/auth/guards/role.guard';
import { Roles } from '@app/auth/decorators/roles.decorator';

@Resolver()
export class NotificationStorageResolver {
    constructor(
        public notificationStorageService: NotificationStorageService,
        @Inject(forwardRef(() => NotificationService))
        public notificationService: NotificationService
    ) {

    }

    @Query(_ => NotificationStorageModel, {
        description: dedent`
        알림 저장소를 조회합니다. - 관리자 권한

        **에러 코드**
        - \`NOT_FOUND\`: 해당 사용자를 찾을 수 없습니다.
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async notificationStorage(
        @Args("id", { type: () => ID, description: "알림 ID" }) id: string,
    ) {
        const info = await this.notificationStorageService.findOne(id);
        if (info === null) throw new NotFoundGraphQLError();
        return info;
    }

    @Query(_ => NotificationStorageList, {
        description: dedent`
        알림 저장소 목록를 조회합니다. - 관리자 권한

        [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async notificationStorages(
        @Args() args: NotificationStorageArgs,
        @Info() info: GraphQLResolveInfo,
    ) {
        const fields = graphqlFields(info);
        let result: Partial<NotificationStorageList> = {
            totalCount: null,
            edges: null,
            pageInfo: null,
        };
        try {
            if ("totalCount" in fields)
                result.totalCount = await this.notificationStorageService.countByFilterArgs(args);

            if ("edges" in fields || "pageInfo" in fields)
                result.edges = await this.notificationStorageService.getEdges(args);

            if ("edges" in fields && "pageInfo" in fields)
                result.pageInfo = await this.notificationStorageService.getPageInfo(result.edges as Edge<NotificationStorageEntity>[], args);

            return result;
        } catch (e) {
            if (e instanceof SyntaxError) throw new ApolloError("잘못된 인자입니다.");
            throw e;
        }
    }

    @Mutation(_ => NotificationStorageModel, {
        description: dedent`
        알림 저장소를 생성합니다 - 관리자 권한

        **에러 코드**
        - \`BAD_REQUEWST\`: SPECIFIC은 recipient_ids가 필수 입니다.
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async createNotificationStoreForAdmin(
        @Args("data", { type: () => NotificationStorageCreateInput }) data: NotificationStorageCreateInput,
        @Args("isSend", { type: () => Boolean, description: "즉시 전송 여부", defaultValue: false }) isSend: boolean,
        @Args("recipient_ids", {
            type: () => [ID], nullable: true,
            description: "target이 SPECIFIC일때 필수이며, 그 외는 무시됩니다."
        }) recipient_ids?: string[],
    ) {
        if (data.target === NotificationStorageTargetType.SPECIFIC && (recipient_ids === undefined || recipient_ids === null || recipient_ids.length == 0)) {
            throw new BadRequestGraphQLError("SPECIFIC은 recipient_ids가 필수 입니다.")
        } else {
            recipient_ids = [];
        }

        if(data.scheduledAt){
            data.scheduledAt = this.notificationStorageService.sliceScheduledAt(data.scheduledAt);
        }

        return await this.notificationStorageService.useTransaction(async (manage) => {
            const newData = await this.notificationStorageService.createOne({
                ...data,
                isSend: isSend,
                recipients: recipient_ids.map(item => ({ id: item }))
            }, manage);
            if (isSend === true) {
                await this.notificationStorageService.send(newData, manage);
            }
            return newData;
        })
    }

    @Mutation(_ => NotificationStorageModel, {
        description: dedent`
        알림 저장소를 수정합니다 - 관리자 권한

        **에러 코드**
        - \`BAD_REQUEWST\`: SPECIFIC은 recipient_ids가 필수 입니다.
        - \`BAD_REQUEWST\`: 이미 전송된 알림입니다.
        - \`NOT_FOUND\`: 없는 데이터
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateNotificationStoreForAdmin(
        @Args("id", { type: () => ID, description: "아이디" }) id: string,
        @Args("data", { type: () => NotificationStorageUpdateInput }) data: NotificationStorageUpdateInput,
        @Args("recipient_ids", {
            type: () => [ID], nullable: true,
            description: "target이 SPECIFIC일때 필수이며, 그 외는 무시됩니다."
        }) recipient_ids?: string[],
    ) {

        const info = await this.notificationStorageService.findOne(id);
        if (info === null) {
            throw new NotFoundGraphQLError();
        } else if (info.isSend === true) {
            throw new BadRequestGraphQLError("이미 전송된 알림입니다.");
        }

        if (data.target === NotificationStorageTargetType.SPECIFIC && (recipient_ids === undefined || recipient_ids === null || recipient_ids.length == 0)) {
            throw new BadRequestGraphQLError("SPECIFIC은 recipient_ids가 필수 입니다.")
        } else {
            recipient_ids = [];
        }

        if(data.scheduledAt){
            data.scheduledAt = this.notificationStorageService.sliceScheduledAt(data.scheduledAt);
        }
        const newData = await this.notificationStorageService.updateOne(info.id, { ...data, recipients: recipient_ids.map(item => ({ id: item })) });

        return newData;
    }

    @Mutation(_ => NotificationStorageModel, {
        description: dedent`
        알림 저장소를 삭제합니다 - 관리자 권한

        **에러 코드**
        - \`BAD_REQUEWST\`: 이미 전송된 알림입니다.
        - \`NOT_FOUND\`: 없는 데이터
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async deleteNotificationStoreForAdmin(
        @Args("id", { type: () => ID, description: "아이디" }) id: string
    ) {

        const info = await this.notificationStorageService.findOne(id);
        if (info === null) {
            throw new NotFoundGraphQLError();
        } else if (info.isSend === true) {
            throw new BadRequestGraphQLError("이미 전송된 알림입니다.");
        }
        await this.notificationStorageService.deleteOne(id);
        return info;
    }

    @Mutation(_ => NotificationStorageModel, {
        description: dedent`
        알림 저장소에 해당하는 알림을 전송합니다 - 관리자 권한

        **에러 코드**
        - \`BAD_REQUEWST\`: 이미 전송된 알림입니다.
        - \`NOT_FOUND\`: 없는 데이터
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async sendNotificationStoreForAdmin(
        @Args("id", { type: () => ID, description: "아이디" }) id: string
    ) {
        const info = await this.notificationStorageService.findOne(id);
        if (info === null) {
            throw new NotFoundGraphQLError();
        } else if (info.isSend === true) {
            throw new BadRequestGraphQLError("이미 전송된 알림입니다.");
        }
        return await this.notificationStorageService.useTransaction(async (manage) => {

            await this.notificationStorageService.send(info, manage);
            return await this.notificationStorageService.updateOne(id, { isSend: true }, manage);
        })
    }
}
