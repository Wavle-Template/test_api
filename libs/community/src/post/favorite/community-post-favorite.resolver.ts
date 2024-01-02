import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { User } from "@app/user/user.model";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Int, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { CommunityPost } from "../community-post.model";
import { CommunityPostFavoriteBasicLoader, CommunityPostByAuthorForFavoriteCountLoader } from "./community-post-favorite.loader";
import { CommunityPostFavoriteService } from "./community-post-favorite.service";

@Resolver()
export class CommunityPostFavoriteResolver {
    #communityPostFavoriteService: CommunityPostFavoriteService;

    constructor(communityPostFavoriteService: CommunityPostFavoriteService) {
        this.#communityPostFavoriteService = communityPostFavoriteService;
    }

    @Mutation(returns => Boolean, { description: "커뮤니티 게시글 즐겨찾기 추가" })
    @UseGuards(JwtGuard)
    async addCommunityPostFavorite(
        @Args("postId", { type: () => ID, description: "커뮤니티 카테고리 uuid" }) postId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<boolean> {
        await this.#communityPostFavoriteService.createOne({
            post: { id: postId },
            user: { id: jwtPayload.id }
        });
        return true;
    }

    @Mutation(returns => Boolean, { description: "커뮤니티 게시글 즐겨찾기에서 제거" })
    @UseGuards(JwtGuard)
    async deleteCommunityPostFavorite(
        @Args("postId", { type: () => ID, description: "커뮤니티 게시글 uuid" }) postId: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<boolean> {
        const favorite = await this.#communityPostFavoriteService.find(postId, jwtPayload.id);
        if (favorite && favorite.length === 0) {
            throw new NotFoundGraphQLError("해당 게시글의 즐겨찾기 내역이 존재하지 않습니다.");
        }
        await this.#communityPostFavoriteService.deleteOne(favorite[0].id);
        return true;
    }
}

@Resolver(of => CommunityPost)
export class CommunityPostResolveFieldResolver {
    #communityFavoriteLoader: CommunityPostFavoriteBasicLoader;

    constructor(communityFavoriteLoader: CommunityPostFavoriteBasicLoader) {
        this.#communityFavoriteLoader = communityFavoriteLoader;
    }

    @ResolveField(() => Boolean, { description: "커뮤니티 카테고리 즐겨찾기 추가 여부", defaultValue: false })
    @UseGuards(JwtGuard)
    async isFavorite(@CurrentJwtPayload() jwtPayload: AuthTokenPayload, @Parent() post: CommunityPost): Promise<boolean> {
        if (!jwtPayload) {
            return false;
        }
        const postFavorite = await this.#communityFavoriteLoader.get({ userId: jwtPayload.id, communityPostId: post.id });
        return postFavorite ? true : false;
    }
}

@Resolver(of => User)
export class UserCommunityPostFavoriteCountFieldResolver {
    #communityPostByAuthorForFavoriteCountLoader: CommunityPostByAuthorForFavoriteCountLoader;

    constructor(
        communityPostByAuthorForFavoriteCountLoader: CommunityPostByAuthorForFavoriteCountLoader,
    ) {
        this.#communityPostByAuthorForFavoriteCountLoader = communityPostByAuthorForFavoriteCountLoader;
    }

    @ResolveField(returns => Int, { defaultValue: 0 })
    async communityPostFavoriteCount(@Parent() user: User): Promise<number> {
        const cnt = await this.#communityPostByAuthorForFavoriteCountLoader.get(user.id);
        return cnt
    }
}