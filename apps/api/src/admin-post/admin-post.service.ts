/**
 * @module AdminPostService
 */
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager } from "typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { AdminPostEntity } from "./admin-post.entity";
import { DeepPartial } from "ts-essentials";

/**
 * 관리자가 올릴 수 있는 공지사항 및 자주 묻는 질문 등을 관리하는 서비스입니다.
 */
@Injectable()
export class AdminPostService extends CRUDService<AdminPostEntity> {
  constructor(@InjectEntityManager() entityManager: EntityManager) {
    super(entityManager, AdminPostEntity);
  }

  async createOne(data: DeepPartial<AdminPostEntity>, transactionManager?: EntityManager): Promise<AdminPostEntity> {
    return this.useTransaction(async manager => {
      if (data.title == null) throw new BadRequestException("title이 비어있습니다.");
      else if (data.content == null) throw new BadRequestException("content가 비어있습니다.");
      else if (data.type == null) throw new BadRequestException("type이 비어있습니다.");

      return super.createOne(data, manager);
    }, transactionManager);
  }

  async createMany(
    datas: DeepPartial<AdminPostEntity>[],
    transactionManager?: EntityManager,
  ): Promise<AdminPostEntity[]> {
    return this.useTransaction(async manager => {
      for (const data of datas) {
        if (data.title != null) throw new BadRequestException("title이 비어있습니다.");
        else if (data.content != null) throw new BadRequestException("content가 비어있습니다.");
        else if (data.type != null) throw new BadRequestException("type이 비어있습니다.");
      }

      return super.createMany(datas, manager);
    }, transactionManager);
  }
}
