import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs } from "@yumis-coconudge/common-module";
import { InquireFilterInput, InquireSortInput } from "./inquire.input";

@ArgsType()
export class InquireListArgs extends MixedPaginationArgs(InquireFilterInput, InquireSortInput) { }
