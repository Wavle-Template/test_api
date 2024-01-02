import { ArgsType } from "@nestjs/graphql";
import { MixedPaginationArgs } from "@yumis-coconudge/common-module";
import { CommunityPostReplyFilterInput, CommunityPostReplyOrderByInput } from "./community-post-reply.input";

@ArgsType()
export class CommunityPostReplyListArgs extends MixedPaginationArgs(CommunityPostReplyFilterInput, CommunityPostReplyOrderByInput) { }