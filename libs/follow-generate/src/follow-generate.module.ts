import { AuthModule } from '@app/auth';
import { UserEntity, UserFollowEntity } from '@app/entity';
import { DynamicModule, Inject } from '@nestjs/common';
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FollowCommonService } from './follow-common.service';
import { checkExistColumn, generateDynamicResolver, IDynamicResolverOption } from './dynamic-resolver'
import { CRUDService, DefaultEntity, DefaultModel, IPagination } from '@yumis-coconudge/common-module';
import { MixedArgs } from '@yumis-coconudge/typeorm-helper';
import { Provider } from '@nestjs/common';
import { EntityClassOrSchema } from '@nestjs/typeorm/dist/interfaces/entity-class-or-schema.type';
import { OnModuleInit } from '@nestjs/common';

interface IInput<Entity extends DefaultEntity> {
  /** 반환되는 List Pagination 모델 */
  listModel: any, 
  /** List Args Model */
  argsModel: any, 
  /** 사용처 모듈의 CRUD Service Provider */
  crudService: Provider<CRUDService<Entity>>, 
  /** 사용되는 Entity */
  entity: EntityClassOrSchema, 
  /** 만들 Graphql 쿼리명 */
  queryName: string
}

@Module({
  imports: [TypeOrmModule.forFeature([UserFollowEntity, UserEntity]), AuthModule],
  providers: [FollowCommonService],
  exports: [FollowCommonService],
})
export class FollowGenerateModule implements OnModuleInit {
  private static UserColumn: string = undefined;
  private static QueryName: string = null;
  private static Entity: EntityClassOrSchema = null;
  onModuleInit() {
    if (!checkExistColumn(FollowGenerateModule.UserColumn, FollowGenerateModule.Entity)) throw new Error(`[${FollowGenerateModule.QueryName}]에는 Follow 조인 컬림이 알맞게 셋팅되지않았습니다. UserColumn : ${FollowGenerateModule.UserColumn}`)

  }

  /**
   * 
   * @param input 
   * @param option 
   * @template Model 기본 모델
   * @template Entity Entity
   * @template ArgsType List Args
   * @returns 
   */
  static register<Model extends DefaultModel, Entity extends DefaultEntity, ArgsType extends MixedArgs>(
    input: IInput<Entity>,
    option?: IDynamicResolverOption): DynamicModule {
    FollowGenerateModule.UserColumn = option?.userColumn ?? undefined;
    FollowGenerateModule.QueryName = input.queryName ?? undefined;
    FollowGenerateModule.Entity = input.entity;
    return {
      imports: [TypeOrmModule.forFeature([input.entity])],
      providers: [
        generateDynamicResolver<Model, Entity, ArgsType>(input.listModel, input.crudService, input.argsModel, input.queryName, option), input.crudService,
      ],
      module: FollowGenerateModule
    }
  }
}
