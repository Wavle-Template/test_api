import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { CommunityCategory } from "../community-category.model";
import { CommunityCategoryFavoriteByUserIdLoader } from "./community-category-favorite.loader";
import { CommunityCategoryFavoriteService } from "./community-category-favorite.service";

@Resolver()
export class CommunityCategoryFavoriteResolver {
  #communityCategoryFavoriteService: CommunityCategoryFavoriteService;

  constructor(communityCategoryFavoriteService: CommunityCategoryFavoriteService) {
    this.#communityCategoryFavoriteService = communityCategoryFavoriteService;
  }

  @Mutation(returns => Boolean, { description: "커뮤니티 카테고리 즐겨찾기 추가" })
  @UseGuards(JwtGuard)
  async addCommunityCategoryFavorite(
    @Args("communityCategoryId", { type: () => ID, description: "커뮤니티 카테고리 uuid" }) communityCategoryId: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<boolean> {
    await this.#communityCategoryFavoriteService.createOne({
      communityCategory: { id: communityCategoryId },
      user: { id: jwtPayload.id }
    });
    return true;
  }

  @Mutation(returns => Boolean, { description: "커뮤니티 카테고리 즐겨찾기에서 제거" })
  @UseGuards(JwtGuard)
  async deleteCommunityCategoryFavorite(
    @Args("communityCategoryId", { type: () => ID, description: "커뮤니티 카테고리 uuid" }) communityCategoryId: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<boolean> {
    const favorite = await this.#communityCategoryFavoriteService.find(communityCategoryId, jwtPayload.id);
    if (favorite && favorite.length === 0) {
      throw new NotFoundGraphQLError("해당 카테고리의 즐겨찾기 내역이 존재하지 않습니다.");
    }
    await this.#communityCategoryFavoriteService.deleteOne(favorite[0].id);
    return true;
  }
}

@Resolver(of => CommunityCategory)
export class CommunityCategoryResolveFieldResolver {
  #communityFavoriteLoader: CommunityCategoryFavoriteByUserIdLoader;

  constructor(communityFavoriteLoader: CommunityCategoryFavoriteByUserIdLoader) {
    this.#communityFavoriteLoader = communityFavoriteLoader;
  }

  @ResolveField(() => Boolean, { description: "커뮤니티 카테고리 즐겨찾기 추가 여부", defaultValue: false })
  @UseGuards(JwtGuard)
  async isFavorite(@CurrentJwtPayload() jwtPayload: AuthTokenPayload, @Parent() community: CommunityCategory): Promise<boolean> {
    if (!jwtPayload) {
      return false;
    }
    const favorites = await this.#communityFavoriteLoader.get({ userId: jwtPayload.id, communityCategoryId: community.id });
    return favorites ? true : false;
  }
}
