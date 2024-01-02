import { CurrentJwtPayload } from '@app/auth/decorators/current-jwt-payload.decorator';
import { JwtGuard } from '@app/auth/guards/jwt.guard';
import { AuthTokenPayload } from '@app/auth/token/payload.interface';
import { UseGuards } from '@nestjs/common';
import { Args, ID, Info, Int, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BadRequestGraphQLError, ForbiddenGraphQLError, IPagination, NotFoundGraphQLError } from '@yumis-coconudge/common-module';
import { GraphQLResolveInfo } from 'graphql';
import { MatchPostEntity } from './match-post.entity';
import { MatchPost, MatchPostList, MatchPostListArgs, MatchPostUpdateInput } from './match-post.model';
import { MatchPostService } from './match-post.service';
import graphqlFields from 'graphql-fields'
import { BaseUserService } from '@app/user';
import { NotificationType } from '@app/entity/notification/notification.enum';
import { MatchPostStateEnum } from './match-post.enum';
import { FileEntity, UserEntity, UserRole } from '@app/entity';
import { User } from '@app/user/user.model';
import { MatchPostCategoryEntity } from '../catrgory/match-post-category.entity';
import { MatchPostTypeEntity } from '../type/match-post-type.entity';
import { MatchPostBasicLoader } from './match-post.loader';
import { BaseUserLoader } from '@app/user/user.loader';
import { MatchPostCategoryBasicLoader } from '../catrgory/match-post-category.loader';
import { MatchPostTypeBasicLoader } from '../type/match-post-type.loader';
import { FileService, GraphQLFile } from '@app/file';
import { BaseNotificationService } from '@app/notification';

@Resolver(of => MatchPost)
export class MatchPostResolver {
    #matchPostService: MatchPostService;
    #baseUserService: BaseUserService;
    #notificationService: BaseNotificationService;
    #matchPostBaseLoader: MatchPostBasicLoader;
    #baseUserLoader: BaseUserLoader;
    #matchPostCategoryLoader: MatchPostCategoryBasicLoader;
    #matchPostTypeLoader: MatchPostTypeBasicLoader;
    #fileService: FileService;
    constructor(
        matchPostService: MatchPostService,
        baseUserService: BaseUserService,
        notificationService: BaseNotificationService,
        matchPostBaseLoader: MatchPostBasicLoader,
        baseUserLoader: BaseUserLoader,
        matchPostCategoryLoader: MatchPostCategoryBasicLoader,
        matchPostTypeLoader: MatchPostTypeBasicLoader,
        fileService: FileService
    ) {
        this.#matchPostService = matchPostService;
        this.#baseUserService = baseUserService;
        this.#notificationService = notificationService;
        this.#matchPostBaseLoader = matchPostBaseLoader;
        this.#baseUserLoader = baseUserLoader;
        this.#matchPostCategoryLoader = matchPostCategoryLoader;
        this.#matchPostTypeLoader = matchPostTypeLoader;
        this.#fileService = fileService;
    }

    @Query(returns => MatchPost, { description: "매칭 게시물 단일 조회" })
    @UseGuards(JwtGuard)
    async matchPost(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const post = await this.#matchPostService.findOne(id, ["author"]);
        if (!post) {
            throw new NotFoundGraphQLError("해당 매칭 게시물을 찾을 수 없습니다.", "id");
        }

        // if (jwtPayload != null) {
        //     const currentUser = await this.#userService.findOne(jwtPayload.id, ["blocks"]);
        //     if (currentUser.blocks?.some(blockedUser => blockedUser.id === post.authorId)) {
        //         throw new BadRequestGraphQLError("차단한 사용자입니다.");
        //     }
        // }

        return post;
    }

    @Query(returns => MatchPostList, { description: "매칭 게시물 목록 조회" })
    @UseGuards(JwtGuard)
    async matchPosts(
        @Args() args: MatchPostListArgs,
        @Info() info: GraphQLResolveInfo,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<Partial<IPagination<MatchPostEntity>>> {
        const fields = graphqlFields(info);
        let result: Partial<IPagination<MatchPostEntity>> = {};

        // const postRelations = ["author", "category", "trader", "type", "likes"];

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.#matchPostService.countByFilterArgs(args)
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.#matchPostService.getEdges(args);
            result = {
                ...result,
                edges: edges,
                pageInfo: await this.#matchPostService.getPageInfo(edges, args)
            };
        }

        return result;
    }

    @Mutation(returns => MatchPost, { description: "매칭 게시물 파일 변경" })
    @UseGuards(JwtGuard)
    async updateMatchPostFiles(
        @Args("id", { type: () => ID }) id: string,
        @Args("fileIds", { type: () => [ID] }) fileIds: string[],
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const matchPost = await this.#matchPostService.findOne(id, ["author"]);
        if (matchPost === null) {
            throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.")
        } else if (matchPost.authorId !== jwtPayload.id) {
            throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.")
        } else if (
            (matchPost.state === MatchPostStateEnum.DEAL_DONE)
        ) {
            throw new BadRequestGraphQLError("이미 거래가 완료되었습니다.");
        } else if (matchPost.state !== MatchPostStateEnum.IN_PROGRESS) {
            throw new BadRequestGraphQLError("변경가능한 상태가 아닙니다.");
        }
        await this.#fileService.setPriority(fileIds);
        const updatedPost = await this.#matchPostService.updateFiles(id, fileIds);

        return updatedPost;
    }

    @Mutation(returns => MatchPost, { description: "매칭 게시물 조회수 +1" })
    async incrementMatchPostViewCount(@Args("id", { type: () => ID }) id: string): Promise<MatchPostEntity> {
        const matchPost = await this.#matchPostService.findOne(id, ["author"]);
        if (matchPost === null) {
            throw new NotFoundGraphQLError("일치하는 매칭 게시물이 없습니다.")
        }
        const updatedPost = await this.#matchPostService.incrementViewCount(id);
        // await this.#pubSub.publish(MATCH_POST_RECEIVED, updatedPost);
        return updatedPost;
    }

    @Mutation(returns => MatchPost, { description: "매칭 게시물 좋아요" })
    @UseGuards(JwtGuard)
    async addMatchPostLike(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const user = await this.#baseUserService.findOne(jwtPayload.id);
        if (user === null) throw new ForbiddenGraphQLError();
        const post = await this.#matchPostService.findOne(id);
        if (post == null) throw new NotFoundGraphQLError();
        const updatedPost = await this.#matchPostService.addLike(id, user.id);
        // await this.#pubSub.publish(MATCH_POST_RECEIVED, updatedPost);

        /**
         * 게시물 작성자에게 좋아요 알림
         **/
        if (jwtPayload.id !== updatedPost.authorId) {
            await this.#notificationService.send({
                recipients: [{ id: updatedPost.authorId }],
                message: `${user.name}님이 좋아요를 눌렀습니다.`,
                url: updatedPost.deepLinkUrl,
                relationId: updatedPost.id,
                type: NotificationType.MATCH_POST,
            });
        }

        return updatedPost;
    }

    @Mutation(returns => MatchPost, { description: "매칭 게시물 좋아요 취소(제거)" })
    @UseGuards(JwtGuard)
    async deleteMatchPostLike(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ): Promise<MatchPostEntity> {
        const user = await this.#baseUserService.findOne(jwtPayload.id);
        if (user === null) throw new ForbiddenGraphQLError();
        const post = await this.#matchPostService.findOne(id);
        if (post == null) throw new NotFoundGraphQLError();
        const updatedPost = await this.#matchPostService.deleteLike(id, jwtPayload.id);
        // await this.#pubSub.publish(MATCH_POST_RECEIVED, updatedPost);
        return updatedPost;
    }

    //resolveFields

    @ResolveField(returns => Boolean, { description: "해당 게시물 좋아요 여부", defaultValue: false })
    @UseGuards(JwtGuard)
    async isLike(@CurrentJwtPayload() jwtPayload: AuthTokenPayload, @Parent() post: MatchPost): Promise<boolean> {
        return (await this.#matchPostBaseLoader.getIsLike({ matchPostsId: post.id, usersId: jwtPayload.id })) ? true : false;
    }

    @ResolveField(returns => [GraphQLFile], { description: "게시물 이미지, 영상", nullable: true })
    @UseGuards(JwtGuard)
    async files(@Parent() matchPost: MatchPost): Promise<FileEntity[]> {
        return (await this.#matchPostBaseLoader.getMatch(matchPost.id)).files;
    }

    @ResolveField(returns => [File], { description: "게시물 작성자" })
    @UseGuards(JwtGuard)
    async author(@Parent() matchPost: MatchPostEntity): Promise<UserEntity> {
        return await this.#baseUserLoader.getInfo(matchPost.authorId);
    }

    @ResolveField(returns => User, { description: "거래 상대방", nullable: true })
    @UseGuards(JwtGuard)
    async trader(@Parent() matchPost: MatchPostEntity): Promise<UserEntity> {
        if (!matchPost.traderId) {
            return null;
        }
        return await this.#baseUserLoader.getInfo(matchPost.traderId);
    }

    @ResolveField(returns => [File], { description: "게시물 카테고리", nullable: true })
    @UseGuards(JwtGuard)
    async category(@Parent() matchPost: MatchPostEntity): Promise<MatchPostCategoryEntity> {
        if (matchPost.categoryId) {
            return await this.#matchPostCategoryLoader.get(matchPost.categoryId);
        }
        return null;
    }

    @ResolveField(returns => [File], { description: "게시물 타입", nullable: true })
    @UseGuards(JwtGuard)
    async type(@Parent() matchPost: MatchPostEntity): Promise<MatchPostTypeEntity> {
        if (!matchPost.typeId) {
            return null;
        }
        return await this.#matchPostTypeLoader.get(matchPost.typeId);
    }

    // @ResolveField(returns => [Hashtag], { description: "해시태그", nullable: true })
    // @UseGuards(JwtGuard)
    // async hashtags(@Parent() matchPost: MatchPost): Promise<HashtagEntity[]> {
    //     return (await this.#matchPostBasicLoader.get(matchPost.id)).hashtags;
    // }

    @ResolveField(returns => [User], { description: "사용자 태그", nullable: true })
    @UseGuards(JwtGuard)
    async usertags(@Parent() matchPost: MatchPost): Promise<UserEntity[]> {
        return (await this.#matchPostBaseLoader.getMatch(matchPost.id)).usertags;
    }

}


@Resolver(of => User)
export class UserMatchPostCountFieldResolver {
    #matchPostBasicLoader: MatchPostBasicLoader;

    constructor(matchPostBasicLoader: MatchPostBasicLoader) {
        this.#matchPostBasicLoader = matchPostBasicLoader;
    }

    @ResolveField(returns => Int, { defaultValue: 0 })
    async matchPostCount(@Parent() user: User): Promise<number> {
        const cnt = await this.#matchPostBasicLoader.getMatchPostCnt(user.id);
        return cnt
    }
}