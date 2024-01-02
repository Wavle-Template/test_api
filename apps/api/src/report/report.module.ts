import { AuthModule } from "@app/auth";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserLoader } from "../user/user.loader";
import { ReportEntity } from "./report.entity";
import { ReportLoader } from "./report.loader";
import { ReportResolver } from "./report.resolver";
import { ReportService } from "./report.service";

@Module({
  imports: [
    TypeOrmModule.forFeature([ReportEntity]),
    AuthModule
  ],
  providers: [ReportService, ReportResolver, ReportLoader, UserLoader],
})
export class ReportModule { }
