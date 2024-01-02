import * as graphqlFields from "graphql-fields";
import { Inject, UseGuards } from "@nestjs/common";
import {
  Args,
  ID,
  Info,
  Int,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription
} from "@nestjs/graphql";
import {
  BadRequestGraphQLError,
  NotFoundGraphQLError,
} from "@yumis-coconudge/common-module";
import { GraphQLResolveInfo } from "graphql";
import {
  CommunityPostBasicLoader,
  CommunityPostByAuthorForCountLoader,
  CommunityPostByAuthorForHideCountLoader,
  CommunityPostByAuthorForLikeCountLoader,
  CommunityPostForHideLoader,
  CommunityPostForLikeLoader
} from "./community-post.loader";
import {
  CommunityPost,
  CommunityPostCreateInput,
  CommunityPostList,
  CommunityPostUpdateInput
} from "./community-post.model";
import { CommunityPostService } from "./community-post.service";
import { CommunityPostEntity } from "./community-post.entity";
import { COMMUNITY_POST_PUB_SUB_TOKEN, COMMUNITY_POST_RECEIVED, MENTION_ME, MY_POST_LIKE } from "../community.const";
import { CommunityCategoryBasicLoader } from "../category/community-category.loader";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { BaseUserService } from "@app/user";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { CommunityPostListArgs } from "./community-post.args";
import { Edge, FilterOperators } from "@yumis-coconudge/typeorm-helper";
import { BaseNotificationService } from "@app/notification";
import { NotificationType } from "@app/entity/notification/notification.enum";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { FileEntity, UserEntity, UserRole } from "@app/entity";
import { BaseUserLoader } from "@app/user/user.loader";
import { CommunityCategoryEntity } from "../category/community-category.entity";
import { User } from "@app/user/user.model";
import { NotificationEntity } from "@app/entity/notification/notification.entity";
import { Notification } from "@app/notification/notification.model";
import { FileService, GraphQLFile } from "@app/file";

@Resolver(of => CommunityPost)
export class CommunityPostResolver {
  #communityPostService: CommunityPostService;
  #communityPostForLikeLoader: CommunityPostForLikeLoader;
  #communityPostForHideLoader: CommunityPostForHideLoader;
  #communityPostBasicLoader: CommunityPostBasicLoader;
  #communityCategoryLoader: CommunityCategoryBasicLoader;
  #pubSub: RedisPubSub;
  #notification: BaseNotificationService;
  // #userFollowService: UserFollowService;
  // #dynamicLinkService: DynamicLinkService;
  #userService: BaseUserService;
  #userBasicLoader: BaseUserLoader;
  // #notificationKeywordService: NotificationKeywordService;
  #fileService: FileService;
  // #bookmarkService: BookmarkService;
  constructor(
    communtityPostService: CommunityPostService,
    communityPostForLikeLoader: CommunityPostForLikeLoader,
    communityPostForHideLoader: CommunityPostForHideLoader,
    communityPostBasicLoader: CommunityPostBasicLoader,
    // hashtagService: HashtagService,
    communityCategoryLoader: CommunityCategoryBasicLoader,
    userBasicLoader: BaseUserLoader,
    notification: BaseNotificationService,
    // userFollowService: UserFollowService,
    // dynamicLinkService: DynamicLinkService,
    userService: BaseUserService,
    // notificationKeywordService: NotificationKeywordService,
    fileService: FileService,
    // bookmarkService: BookmarkService,
    @Inject(COMMUNITY_POST_PUB_SUB_TOKEN) pubSub?: RedisPubSub
  ) {
    this.#communityPostService = communtityPostService;
    this.#communityPostForLikeLoader = communityPostForLikeLoader;
    // this.#communityPostForHideLoader = communityPostForHideLoader;
    this.#communityPostBasicLoader = communityPostBasicLoader;
    // this.#hashtagService = hashtagService;
    this.#communityCategoryLoader = communityCategoryLoader;
    this.#userBasicLoader = userBasicLoader;
    this.#pubSub = pubSub;
    // this.#notification = notification;
    // this.#userFollowService = userFollowService;
    // this.#dynamicLinkService = dynamicLinkService;
    this.#userService = userService;
    // this.#notificationKeywordService = notificationKeywordService;
    this.#fileService = fileService;
    // this.#bookmarkService = bookmarkService;
  }

  @Query(returns => CommunityPost, { description: "커뮤니티 게시물 단일 조회" })
  @UseGuards(JwtGuard)
  async communityPost(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const post = await this.#communityPostService.findOne(id, ["author"]);
    if (!post) {
      throw new NotFoundGraphQLError("해당 게시물을 찾을 수 없습니다.", "id");
    }

    if (jwtPayload != null) {
      const currentUser = await this.#userService.findOne(jwtPayload.id, ["blocks"]);
      if (currentUser.blocks?.some(blockedUser => blockedUser.id === post.authorId)) {
        throw new BadRequestGraphQLError("차단한 사용자입니다.");
      }
    }

    return await this.#communityPostService.incrementViewCount(id, jwtPayload.id);;
  }

  @Query(returns => CommunityPostList, { description: "커뮤니티 게시물 목록 조회" })
  @UseGuards(JwtGuard)
  async communityPosts(
    @Args() args: CommunityPostListArgs,
    @Info() info: GraphQLResolveInfo,
  ): Promise<CommunityPostList> {
    const fields = graphqlFields(info);
    let result: Partial<CommunityPostList> = {};

    if ("totalCount" in fields) {
      result = {
        ...result,
        totalCount: await this.#communityPostService.countByFilterArgs(args)
      };
    }
    if ("edges" in fields || "pageInfo" in fields) {
      const edges = await this.#communityPostService.getEdges(args);
      result = {
        ...result,
        edges: edges as unknown as Edge<CommunityPost>[],
        pageInfo: await this.#communityPostService.getPageInfo(edges, args)
      };
    }

    return result as CommunityPostList
  }

  @Mutation(returns => CommunityPost, { description: "커뮤니티 게시물 생성" })
  @UseGuards(JwtGuard)
  async createCommunityPost(
    @Args("data") data: CommunityPostCreateInput,
    @CurrentJwtPayload() currentUser: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const user = await this.#userService.findOne(currentUser.id);
    const { usertag__ids, ...othersData } = data;
    let newPost: CommunityPostEntity = null;

    newPost = await this.#communityPostService.createOne({
      ...othersData,
      category: { id: data.category__id },
      author: { id: currentUser.id },
      hashtags: data.hashtags,
      usertags:
        usertag__ids != null
          ? usertag__ids.map(userId => {
            return { id: userId };
          })
          : undefined,
      files: data.file__ids != null ? data.file__ids.map(fileId => ({ id: fileId })) : undefined
    });

    //TODO:딥링크 만들기.
    // if (
    //   environmentVariablesManager.get("dynamicLinkDomainUrlPrefix") &&
    //   environmentVariablesManager.get<string>("matchPostDeepLinkUrl")
    // ) {
    //   const deepLinkUrl = await this.#dynamicLinkService.createShortLink({
    //     dynamicLinkInfo: {
    //       domainUriPrefix: environmentVariablesManager.get("dynamicLinkDomainUrlPrefix"),
    //       link: environmentVariablesManager
    //         .get<string>("matchPostDeepLinkUrl")
    //         .replace("$community_post_id", newPost.id)
    //     }
    //   });
    //   newPost = await this.#communityPostService.update(newPost.id, { deepLinkUrl: deepLinkUrl });
    // }

    await this.#pubSub.publish(COMMUNITY_POST_RECEIVED, newPost);

    /**멘션 알림 */
    if (usertag__ids) {
      await this.#notification.send({
        recipients: usertag__ids.map(item => ({ id: item })),
        message: `${user.name}${MENTION_ME}`,
        // url: newPost.deepLinkUrl,
        relationId: newPost.id,
        type: NotificationType.COMMUNITY_POST,
      });
    }

    //TODO:팔로워/키워드 #17 알림 추가

    // /**나의 팔로워에게 알림 */
    // const myFollwers = await this.#userFollowService.find({ followingUser: { id: user.id } }, ["follower"]);
    // if (myFollwers && myFollwers.length > 0) {
    //   await this.#notification.sendNotification({
    //     receiver__ids: myFollwers.map(follower => follower.follower.id),
    //     message: `${user.name}${FOLLOWING_POST}`,
    //     url: newPost.deepLinkUrl,
    //     relationId: newPost.id,
    //     type: NotificationTypeEnumType.COMMUNITY_POST,
    //     otherUserId: user.id
    //   });
    // }

    // /** 키워드 알림 */
    // const extractedkeywords = await this.#notificationKeywordService.searchFromText(newPost.content, user.id);
    // if (extractedkeywords && extractedkeywords.length > 0) {
    //   const extractedkeywordUserIds = extractedkeywords.reduce((acc, val) => acc.concat(val.userIds), []);
    //   const receiverIds = [...new Set(extractedkeywordUserIds)];

    //   await this.#notification.sendNotification({
    //     receiver__ids: receiverIds,
    //     message: KEYWORD_NOTI,
    //     url: newPost.deepLinkUrl,
    //     relationId: newPost.id,
    //     type: NotificationTypeEnumType.COMMUNITY_POST,
    //     otherUserId: user.id
    //   });
    // }

    return newPost;
  }

  @Mutation(returns => CommunityPost, { description: "커뮤니티 게시물 수정" })
  @UseGuards(JwtGuard)
  async updateCommunityPost(
    @Args("id", { type: () => ID }) id: string,
    @Args("data") data: CommunityPostUpdateInput,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const { usertag__ids, ...othersData } = data;

    const post = await this.#communityPostService.findOne(id, ["author"]);
    if (post === null) {
      throw new NotFoundGraphQLError();
    } else if (post.author.id !== jwtPayload.id) {
      throw new NotFoundGraphQLError();
    }

    const updatedPost = await this.#communityPostService.updateOne(id, {
      ...othersData,
      hashtags: data.hashtags,
      usertags:
        usertag__ids != null
          ? usertag__ids.map(userId => {
            return { id: userId };
          })
          : undefined
    });
    await this.#pubSub.publish(COMMUNITY_POST_RECEIVED, updatedPost);
    return updatedPost;
  }

  @Mutation(returns => CommunityPost, { description: "커뮤니티 게시물 파일 변경" })
  @UseGuards(JwtGuard)
  async updateCommunityPostFiles(
    @Args("id", { type: () => ID }) id: string,
    @Args("fileIds", { type: () => [ID] }) fileIds: string[],
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const post = await this.#communityPostService.findOne(id, ["author"]);
    if (post === null) {
      throw new NotFoundGraphQLError();
    } else if (post.author.id !== jwtPayload.id) {
      throw new NotFoundGraphQLError();
    }
    await this.#fileService.setPriority(fileIds);
    const updatedPost = await this.#communityPostService.updateFiles(id, fileIds);
    // if (user.role !== UserRole.ADMIN) {
    //   await this.#bookmarkService.bookmarkThumbnailCacheClear(updatedPost.id, user.id);
    // }
    await this.#pubSub.publish(COMMUNITY_POST_RECEIVED, updatedPost);
    return updatedPost;
  }

  @Mutation(returns => CommunityPost, { description: "커뮤니티 게시물 조회수 +1" })
  @UseGuards(JwtGuard)
  async incrementCommunityPostViewCount(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const updatedPost = await this.#communityPostService.incrementViewCount(id, jwtPayload.id);
    await this.#pubSub.publish(COMMUNITY_POST_RECEIVED, updatedPost);
    return updatedPost;
  }

  @Mutation(returns => CommunityPost, { description: "커뮤니티 게시물 단일 삭제" })
  @UseGuards(JwtGuard)
  async deleteCommunityPost(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const post = await this.#communityPostService.findOne(id, ["author"]);
    if (post === null) {
      throw new NotFoundGraphQLError();
    } else if (post.author.id !== jwtPayload.id) {
      throw new NotFoundGraphQLError();
    }
    const deletedPost = await this.#communityPostService.deleteOne(id);
    // if (user.role !== UserRole.ADMIN) {
    //   await this.#bookmarkService.bookmarkThumbnailCacheClear(deletedPost.id, user.id);
    // }
    await this.#pubSub.publish(COMMUNITY_POST_RECEIVED, deletedPost);
    return deletedPost;
  }

  @Mutation(returns => [CommunityPost], { description: "커뮤니티 게시물 복수 삭제 관리자 전용" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteCommunityPostsForAdmin(@Args("ids", { type: () => [ID] }) ids: string[]): Promise<CommunityPostEntity[]> {
    const result = await this.#communityPostService.deleteMany(ids);
    return result;
  }

  @Mutation(returns => [CommunityPost], { description: "커뮤니티 게시물 상단 고정 관리자 전용" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async pinCommunityPostsForAdmin(
    @Args("ids", { type: () => [ID] }) ids: string[],
    @Args("isPinned", { type: () => Boolean, description: "상단 고정 여부" }) isPinned: boolean,
  ): Promise<CommunityPostEntity[]> {
    if (isPinned === true) {
      const nowCnt = await this.#communityPostService.countByFilterArgs({
        filter: {
          isPinned: [{ value: true, operator: FilterOperators.EQUAL }]
        }
      })
      const newCnt = await this.#communityPostService.countByFilterArgs({
        filter: {
          isPinned: [{ value: false, operator: FilterOperators.EQUAL }],
          id: [{ values: ids, operator: FilterOperators.IN }]
        }
      })
      if ((nowCnt + newCnt) > 5) {
        throw new BadRequestGraphQLError("상단 고정은 5개까지만 가능합니다.");
      }
    }
    const result = await this.#communityPostService.updateMany(ids, {
      isPinned: isPinned,
      pinnedAt: isPinned === true ? new Date() : null
    });
    return result;
  }

  @Mutation(returns => CommunityPost, { description: "커뮤니티 게시물 좋아요" })
  @UseGuards(JwtGuard)
  async addCommunityPostLike(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const user = await this.#userService.findOne(jwtPayload.id);
    const updatedPost = await this.#communityPostService.addLike(id, user.id);
    await this.#pubSub.publish(COMMUNITY_POST_RECEIVED, updatedPost);

    /**
     * 게시물 작성자에게 좋아요 알림
     **/
    if (jwtPayload.id !== updatedPost.authorId) {
      await this.#notification.send({
        recipients: [{ id: updatedPost.authorId }],
        message: `${user.name}${MY_POST_LIKE}`,
        url: updatedPost.deepLinkUrl,
        relationId: updatedPost.id,
        type: NotificationType.COMMUNITY_POST,
      });
    }

    return updatedPost;
  }

  @Mutation(returns => CommunityPost, { description: "커뮤니티 게시물 좋아요 취소(제거)" })
  @UseGuards(JwtGuard)
  async deleteCommunityPostLike(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const updatedPost = await this.#communityPostService.deleteLike(id, jwtPayload.id);
    await this.#pubSub.publish(COMMUNITY_POST_RECEIVED, updatedPost);
    return updatedPost;
  }

  @Mutation(returns => CommunityPost, { description: "커뮤니티 게시물 숨기기" })
  @UseGuards(JwtGuard)
  async addCommunityPostHide(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const user = await this.#userService.findOne(jwtPayload.id);
    const updatedPost = await this.#communityPostService.addLike(id, user.id);
    await this.#pubSub.publish(COMMUNITY_POST_RECEIVED, updatedPost);

    return updatedPost;
  }

  @Mutation(returns => CommunityPost, { description: "커뮤니티 게시물 숨기기 취소(제거)" })
  @UseGuards(JwtGuard)
  async deleteCommunityPostHide(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostEntity> {
    const updatedPost = await this.#communityPostService.deleteLike(id, jwtPayload.id);
    await this.#pubSub.publish(COMMUNITY_POST_RECEIVED, updatedPost);
    return updatedPost;
  }

  @Subscription(returns => CommunityPost, {
    description: "커뮤니티 게시물 수신",
    filter(this: CommunityPostResolver, payload: CommunityPostEntity, variables: { categoryId: string }) {
      return payload.categoryId === variables.categoryId;
    },
    resolve: value => value
  })
  @UseGuards(JwtGuard)
  async receiveCommunityPost(
    @Args("categoryId", { type: () => ID }) categoryId: string
  ): Promise<AsyncIterator<CommunityPostEntity, unknown, undefined>> {
    return this.#pubSub.asyncIterator<CommunityPostEntity>(COMMUNITY_POST_RECEIVED);
  }

  @ResolveField(returns => Boolean, { description: "해당 게시물 좋아요 여부", defaultValue: false })
  @UseGuards(JwtGuard)
  async isLike(@CurrentJwtPayload() jwtPayload: AuthTokenPayload, @Parent() post: CommunityPost): Promise<boolean> {
    return (await this.#communityPostForLikeLoader.get({ communityPostsId: post.id, usersId: jwtPayload.id })) ? true : false;
  }

  @ResolveField(returns => Boolean, { description: "해당 게시물 숨기기 여부", defaultValue: false })
  @UseGuards(JwtGuard)
  async isHide(@CurrentJwtPayload() jwtPayload: AuthTokenPayload, @Parent() post: CommunityPost): Promise<boolean> {
    return (await this.#communityPostForHideLoader.get({ communityPostsId: post.id, usersId: jwtPayload.id })) ? true : false;
  }

  @ResolveField(returns => [GraphQLFile], { description: "게시물 이미지, 영상", nullable: true })
  @UseGuards(JwtGuard)
  async files(@Parent() communityPost: CommunityPost): Promise<FileEntity[]> {
    return (await this.#communityPostBasicLoader.get(communityPost.id)).files;
  }

  @ResolveField(returns => [File], { description: "게시물 작성자" })
  @UseGuards(JwtGuard)
  async author(@Parent() communityPost: CommunityPostEntity): Promise<UserEntity> {
    return await this.#userBasicLoader.getInfo(communityPost.authorId);
  }

  @ResolveField(returns => [File], { description: "게시물 카테고리", nullable: true })
  @UseGuards(JwtGuard)
  async category(@Parent() communityPost: CommunityPostEntity): Promise<CommunityCategoryEntity> {
    if (communityPost.categoryId) {
      return await this.#communityCategoryLoader.get(communityPost.categoryId);
    }
    return null;
  }

  // @ResolveField(returns => [Hashtag], { description: "해시태그", nullable: true })
  // @UseGuards(JwtGuard)
  // async hashtags(@Parent() communityPost: CommunityPost): Promise<HashtagEntity[]> {
  //   return (await this.#communityPostBasicLoader.get(communityPost.id)).hashtags;
  // }

  @ResolveField(returns => [User], { description: "사용자 태그", nullable: true })
  @UseGuards(JwtGuard)
  async usertags(@Parent() communityPost: CommunityPost): Promise<UserEntity[]> {
    return (await this.#communityPostBasicLoader.get(communityPost.id)).usertags;
  }
}

@Resolver(of => Notification)
export class NotificationcommunityPostFieldResolver {
  #communityPostService: CommunityPostService;
  constructor(communityPostService: CommunityPostService) {
    this.#communityPostService = communityPostService;
  }

  @ResolveField(returns => CommunityPost, { nullable: true })
  @UseGuards(JwtGuard)
  async communityPost(@Parent() notification: NotificationEntity): Promise<CommunityPostEntity> {
    const { type } = notification;
    if (type === NotificationType.COMMUNITY_POST) {
      return this.#communityPostService.findOne(notification.relationId);
    }
    return null;
  }
}
@Resolver(of => User)
export class UserCommunityPostCountFieldResolver {
  #communtiyPostByAuthorForCountLoader: CommunityPostByAuthorForCountLoader;
  #communityPostByAuthorForLikeCountLoader: CommunityPostByAuthorForLikeCountLoader;
  #communityPostByAuthorForHideCountLoader: CommunityPostByAuthorForHideCountLoader;

  constructor(
    communtiyPostByAuthorForCountLoader: CommunityPostByAuthorForCountLoader,
    communityPostByAuthorForLikeCountLoader: CommunityPostByAuthorForLikeCountLoader,
    communityPostByAuthorForHideCountLoader: CommunityPostByAuthorForHideCountLoader,
  ) {
    this.#communtiyPostByAuthorForCountLoader = communtiyPostByAuthorForCountLoader;
    this.#communityPostByAuthorForLikeCountLoader = communityPostByAuthorForLikeCountLoader;
    this.#communityPostByAuthorForHideCountLoader = communityPostByAuthorForHideCountLoader;
  }

  @ResolveField(returns => Int, { defaultValue: 0 })
  async communityPostCount(@Parent() user: User): Promise<number> {
    const posts = await this.#communtiyPostByAuthorForCountLoader.get(user.id);
    if (posts) {
      return posts.length;
    }
    return 0;
  }

  @ResolveField(returns => Int, { defaultValue: 0 })
  async communityPostLikeCount(@Parent() user: User): Promise<number> {
    const cnt = await this.#communityPostByAuthorForLikeCountLoader.get(user.id);
    return cnt;
  }

  @ResolveField(returns => Int, { defaultValue: 0 })
  async communityPostHideCount(@Parent() user: User): Promise<number> {
    const cnt = await this.#communityPostByAuthorForHideCountLoader.get(user.id);
    return cnt;
  }
}
