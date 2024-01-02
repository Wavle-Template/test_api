import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs, Pagination } from "@yumis-coconudge/common-module";
import { CommunityPostFilterInput, CommunityPostOrderByInput } from "./community-post.model";

@ArgsType()
export class CommunityPostListArgs extends MixedPaginationArgs(CommunityPostFilterInput, CommunityPostOrderByInput) { }