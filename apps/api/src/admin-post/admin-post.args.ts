import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs } from "@yumis-coconudge/common-module";
import { AdminPostFilterInput, AdminPostSortInput } from "./admin-post.input";

@ArgsType()
export class AdminPostListArgs extends MixedPaginationArgs(AdminPostFilterInput, AdminPostSortInput) {}
