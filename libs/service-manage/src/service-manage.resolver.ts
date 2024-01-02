import { Roles } from '@app/auth/decorators/roles.decorator';
import { JwtGuard } from '@app/auth/guards/jwt.guard';
import { UserRoleGuard } from '@app/auth/guards/role.guard';
import { UserRole } from '@app/entity';
import { Inject, UseGuards } from '@nestjs/common';
import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { SERVICE_MANAGE_STORE } from './service-manage.const';
import { ServiceManage, ServiceManageUpdateInput } from './service-manage.model';
import { ServiceManageService } from './service-manage.service';
import { ServiceManageStore } from './service-manage.store';

@Resolver()
export class ServiceManageResolver {
    #serviceManageService: ServiceManageService;
    #store: ServiceManageStore;
    constructor(
        serviceManageService: ServiceManageService,
        @Inject(SERVICE_MANAGE_STORE) store: ServiceManageStore
    ) {
        this.#serviceManageService = serviceManageService;
        this.#store = store;
    }

    @Query(type => ServiceManage, { description: "서비스 운영 정보" })
    async serviceManage() {
        return this.#store.getInfo();
    }

    @Mutation(type => ServiceManage, { description: "서비스 운영 정보 수정 - 관리자용" })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateServiceManage(
        @Args("data", { type: () => ServiceManageUpdateInput }) data: ServiceManageUpdateInput
    ) {
        const info = this.#store.getInfo();
        await this.#serviceManageService.update(info.id, data);
        const updatedInfo = await this.#serviceManageService.getInfo();
        this.#store.setInfo(updatedInfo);
        return updatedInfo;
    }
}
