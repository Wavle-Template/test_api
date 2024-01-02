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
import { FileEntityModule } from "@app/entity";
import { MicroserviceImageModule } from "@app/microservice";
import { Logger, Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { FileService } from "./file.service";

/**
 * 파일 모듈
 * @hidden
 */
@Module({
    imports: [ConfigModule, MicroserviceImageModule, FileEntityModule],
    providers: [FileService, { provide: Logger, useValue: new Logger(FileModule.name) }],
    exports: [FileService],
})
export class FileModule { }
