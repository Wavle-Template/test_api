import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs } from "@yumis-coconudge/common-module";
import { ReportFilterInput, ReportSortInput } from "./report.input";

@ArgsType()
export class ReportListArgs extends MixedPaginationArgs(ReportFilterInput, ReportSortInput) {}
