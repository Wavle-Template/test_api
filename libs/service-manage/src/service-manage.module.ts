/**
 * 프로젝트 서비스 관리용 모듈
 * @module ServiceManageModule
 */
import { Inject, Module } from '@nestjs/common';
import { ServiceManageService } from './service-manage.service';
import { ServiceManageResolver } from './service-manage.resolver';
import { ServiceManageController } from './service-manage.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ServiceManageEntity } from './service-manage.entity';
import { AuthModule } from '@app/auth';
import { ServiceManageStore } from './service-manage.store';
import { SERVICE_MANAGE_STORE } from './service-manage.const';

@Module({
  imports: [
    TypeOrmModule.forFeature([ServiceManageEntity]),
    AuthModule,
  ],
  providers: [
    ServiceManageService, ServiceManageResolver,
    {
      provide: SERVICE_MANAGE_STORE,
      useValue: new ServiceManageStore()
    }
  ],
  exports: [ServiceManageService],
  controllers: [ServiceManageController],
})
export class ServiceManageModule {
  constructor(
    public serviceManageService: ServiceManageService
  ) {
    if(process.env.NODE_ENV !== "test"){
      setTimeout(() => {
        this.serviceManageService.checkExistAndCreate().catch(err => {
          console.error("===서비스 관리 설정 에러===");
          console.error(err);
        })
      }, 1000)
    }
  }
}
