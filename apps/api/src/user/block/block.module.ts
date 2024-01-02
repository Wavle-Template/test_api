/**
 * 사용자 차단을 관리하기 위한 모듈입니다.
 *
 * ### 다이어그램
 * ```mermaid
 * classDiagram
 * AuthModule --> UserBlockModule : Import
 * UserBlockModule o-- UserBlockService : Provide
 * UserBlockModule o-- UserBlockLoader : Provide
 * UserBlockModule o-- UserBlockResolver : Provide
 * UserBlockService <.. EntityManager : Inject
 * UserBlockLoader <.. EntityManager : Inject
 * UserBlockResolver <.. UserBlockService : Inject
 * UserBlockResolver <.. UserBlockLoader : Inject
 *
 * ```
 * @module UserBlockModule
 */
import { Module } from "@nestjs/common";
import { AuthModule } from "@app/auth";
import { UserBlockLoader } from "./block.loader";
import { UserBlockResolver } from "./block.resolver";
import { UserBlockService } from "./block.service";

/**
 * 사용자 차단 모듈
 * @hidden
 */
@Module({
  imports: [AuthModule],
  providers: [UserBlockService, UserBlockLoader, UserBlockResolver],
  exports: [UserBlockService],
})
export class UserBlockModule {}
