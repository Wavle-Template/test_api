import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs } from "@yumis-coconudge/common-module";
import { CommunityCategoryFilterInput, CommunityCategoryOrderByInput } from "./community-category.input";

@ArgsType()
export class CommunityCategoryListArgs extends MixedPaginationArgs(CommunityCategoryFilterInput, CommunityCategoryOrderByInput) { }