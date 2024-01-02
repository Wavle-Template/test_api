/**
 * 프로젝트 서비스 관리용 모듈
 * @module ServiceManageModule
 */
import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CRUDService } from '@yumis-coconudge/common-module';
import { EntityManager, FindConditions, getConnection, getManager, Repository } from 'typeorm';
import { ServiceManageEntity } from './service-manage.entity';
import LicenseChecker from 'license-checker'
import { SERVICE_MANAGE_STORE } from './service-manage.const';
import { ServiceManageStore } from './service-manage.store';
import { ServiceManageUpdateInput } from './service-manage.model';

interface ILicense {
    name:string;
    publisher:string;
    licenseFileUrl:string;
    licenses:string;
    email:string;
    repository:string;
}

@Injectable()
export class ServiceManageService {
    #repository: Repository<ServiceManageEntity>
    #serviceManageStore: ServiceManageStore;
    constructor(
        @InjectRepository(ServiceManageEntity) serviceManageReportRepository: Repository<ServiceManageEntity>,
        @Inject(SERVICE_MANAGE_STORE) serviceManageStore: ServiceManageStore,
    ) {
        this.#repository = serviceManageReportRepository;
        this.#serviceManageStore = serviceManageStore;        
    }

    private getLicenses(): Promise<ILicense[]>{
        return new Promise((resolve,reject)=>{
            LicenseChecker.init(
                {
                    production: true,
                    start: './',
                    exclude: "MIT,UNKNOWN,UNLICENSED"
                },
                // eslint-disable-next-line no-unused-vars
                function (err, packages) {
                    if (err) {
                        reject(err)
                    } else {
                        const keys = Object.keys(packages);
                        
                        resolve(keys.map(key => {
                            const item = packages[key]
                            return {
                                name: key,
                                email: item.email,
                                repository: item.repository,
                                licenseFileUrl: item.repository + "/LICENSE.txt",
                                licenses: item.licenses,
                                publisher: item.publisher
                                // author:key.
                            } as ILicense
                        }))
                    }
                },
            );
        })
    }

    async update(id: string, input: ServiceManageUpdateInput) {
        return await this.#repository.update(id, input)
    }

    async getInfo() {
        const list = await this.#repository.find();
        if (list.length === 0) throw new Error("NOT_EXIST_SERVICE_MANAGE_INFO");
        return list[0];
    }

    async isExist(manage:EntityManager) {
        const list = await manage.find(ServiceManageEntity);
        return list.length > 0 ? true : false;
    }

    async checkExistAndCreate() {
        const connection = getConnection();
        const queryRunner = connection.createQueryRunner();

        await queryRunner.connect();

        await queryRunner.startTransaction();
        try {
            const isExist = await this.isExist(queryRunner.manager);
            if (isExist !== true) {
                const licenses = await this.getLicenses();
                const info = await queryRunner.manager.create(ServiceManageEntity, {
                    serviceTerms: "이용약관",
                    personalProcessingPolicy: "개인정보처리 방침",
                    openSource: licenses as any
                })
                await queryRunner.manager.save(info);
            }
            await queryRunner.commitTransaction();
            await queryRunner.release();
        } catch (error) {
            console.error(error);
            await queryRunner.rollbackTransaction();
            await queryRunner.release();
        }
        await this.#serviceManageStore.setInfo(await this.getInfo())
    }
}
