/**
 * 파일을 업로드/다운로드 기능을 지원하고, DB에 기록해서 관리합니다.
 *
 * ## 다이어그램
 *
 * ```mermaid
 * classDiagram
 * ConfigModule --> FileModule : Import
 * MicroserviceImageModule --> FileModule : Import
 * FileModule o-- FileService : Provide
 * FileModule o-- FileResolver : Provide
 * FileModule o-- FileController : Provide
 * FileModule o-- Logger : Provide
 * FileResolver <.. ConfigService : Inject
 * FileResolver <.. FileService : Inject
 * FileController <.. ConfigService: Inject
 * FileController <.. FileService : Inject
 * FileService <.. EntityManager : Inject
 * FileService <.. ConfigService : Inject
 * FileService <.. MicroserviceImageService : Inject
 * ```
 * @module FileModule
 */
import { FileModule } from "@app/file";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FileApiController } from "./file-api.controller";
import { FileApiResolver } from "./file-api.resolver";

/**
 * 파일 모듈
 * @hidden
 */
@Module({
  imports: [ConfigModule,FileModule],
  controllers: [FileApiController],
  providers: [FileApiResolver, { provide: Logger, useValue: new Logger(FileApiModule.name) }],
})
export class FileApiModule {}
