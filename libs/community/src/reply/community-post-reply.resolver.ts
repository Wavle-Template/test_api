import * as graphqlFields from "graphql-fields";
import { Inject, UseGuards } from "@nestjs/common";
import {
  Args,
  ArgsType,
  ID,
  Info,
  Mutation,
  Parent,
  Query,
  ResolveField,
  Resolver,
  Subscription
} from "@nestjs/graphql";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import {
  CommunityPostReplyBasicLoader,
  CommunityPostReplyByParentReplyLoader,
  CommunityPostReplyForLikeLoader
} from "./community-post-reply.loader";
import {
  CommunityPostReply,
  CommunityPostReplyList,
} from "./community-post-reply.model";
import { CommunityPostReplyService } from "./community-post-reply.service";
import { GraphQLResolveInfo } from "graphql";
import { CommunityPostReplyEntity } from "./community-post-reply.entity";
import { RedisPubSub } from "graphql-redis-subscriptions";
import { BaseNotificationService } from "@app/notification";
import { BaseUserService } from "@app/user";
import { CommunityPostService } from "../post/community-post.service";
import { COMMUNITY_POST_REPLY_PUB_SUB_TOKEN, COMMUNITY_POST_REPLY_RECEIVED, MENTION_ME, MY_POST_REPLY, MY_REPLY_LIKE } from "../community.const";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { CommunityPostReplyListArgs } from "./community-post-reply.args";
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { CommunityPostReplyCreateInput, CommunityPostReplyUpdateInput } from "./community-post-reply.input";
import { NotificationType } from "@app/entity/notification/notification.enum";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { UserEntity, UserRole } from "@app/entity";
import { User } from "@app/user/user.model";
import { CommunityPostEntity } from "../post/community-post.entity";
import { CommunityPost } from "../post/community-post.model";


@Resolver(of => CommunityPostReply)
export class CommunityPostReplyResolver {
  #communityPostReplyService: CommunityPostReplyService;
  #communityPostReplyByParentReplyLoader: CommunityPostReplyByParentReplyLoader;
  #communityPostReplyForLikeLoader: CommunityPostReplyForLikeLoader;
  #communityPostService: CommunityPostService;
  #pubSub: RedisPubSub;
  #notification: BaseNotificationService;
  #communityPostReplyBasicLoader: CommunityPostReplyBasicLoader;
  #userService: BaseUserService;

  constructor(
    communityPostReplyService: CommunityPostReplyService,
    communityPostReplyByParentReplyLoader: CommunityPostReplyByParentReplyLoader,
    communityPostReplyForLikeLoader: CommunityPostReplyForLikeLoader,
    communityPostService: CommunityPostService,
    notification: BaseNotificationService,
    communityPostReplyBasicLoader: CommunityPostReplyBasicLoader,
    userService: BaseUserService,
    @Inject(COMMUNITY_POST_REPLY_PUB_SUB_TOKEN) pubSub?: RedisPubSub
  ) {
    this.#communityPostReplyService = communityPostReplyService;
    this.#communityPostReplyByParentReplyLoader = communityPostReplyByParentReplyLoader;
    this.#communityPostReplyForLikeLoader = communityPostReplyForLikeLoader;
    this.#communityPostService = communityPostService;
    this.#pubSub = pubSub;
    this.#notification = notification;
    this.#communityPostReplyBasicLoader = communityPostReplyBasicLoader;
    this.#userService = userService;
  }

  @Query(returns => CommunityPostReply, { description: "커뮤니티 게시물 댓글 단일 조회" })
  @UseGuards(JwtGuard)
  async communityPostReply(@Args("id", { type: () => ID }) id: string): Promise<CommunityPostReplyEntity> {
    const reply = await this.#communityPostReplyService.findOne(id);
    if (!reply) {
      throw new NotFoundGraphQLError("해당 댓글이 존재하지 않습니다.", "id");
    }
    return reply;
  }

  @Query(returns => CommunityPostReplyList, { description: "커뮤니티 게시물 댓글 목록 조회" })
  @UseGuards(JwtGuard)
  async communityPostReplies(
    @Args() args: CommunityPostReplyListArgs,
    @Info() info: GraphQLResolveInfo,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<Partial<CommunityPostReplyList>> {
    const fields = graphqlFields(info);
    let result: Partial<CommunityPostReplyList> = {};


    if ("totalCount" in fields) {
      result = {
        ...result,
        totalCount: await this.#communityPostReplyService.countByFilterArgs(args)
      };
    }
    if ("edges" in fields || "pageInfo" in fields) {
      const edges = await this.#communityPostReplyService.getEdges(args);
      result = {
        ...result,
        edges: edges,
        pageInfo: await this.#communityPostReplyService.getPageInfo(edges, args)
      };
    }

    return result;
  }

  @Mutation(returns => CommunityPostReply, { description: "커뮤니티 게시물 댓글 생성" })
  @UseGuards(JwtGuard)
  async createCommunityPostReply(
    @Args("data") data: CommunityPostReplyCreateInput,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostReplyEntity> {
    const user = await this.#userService.findOne(jwtPayload.id);
    const { usertag__ids, ...otherdata } = data;
    const relationData: Record<string, unknown> = {};
    let parentReply: CommunityPostReplyEntity = null;
    relationData.author = { id: user.id };
    if (data.post__id) {
      relationData.post = { id: data.post__id };
    }
    if (data.parent__id) {
      parentReply = await this.#communityPostReplyService.findOne(data.parent__id, ["post"]);
      relationData.parent = { id: data.parent__id };
    }
    const newReply = await this.#communityPostReplyService.createOne(
      {
        ...otherdata,
        ...relationData,
        usertags:
          usertag__ids != null
            ? usertag__ids.map(userId => {
              return { id: userId };
            })
            : undefined
      },
    );
    await this.#communityPostService.incrementReplyCount(newReply.postId);
    await this.#pubSub.publish(COMMUNITY_POST_REPLY_RECEIVED, newReply);

    /**멘션 알림 */
    if (usertag__ids) {
      await this.#notification.send({
        recipients: usertag__ids.map(item => ({ id: item })),
        message: `${user.name}${MENTION_ME}`,
        url: data.post__id ? newReply.post.deepLinkUrl : parentReply.post.deepLinkUrl,
        relationId: data.post__id ? data.post__id : parentReply.id,
        type: NotificationType.COMMUNITY_COMMEND,
      });
    }

    /**
     * 해댕 게시물 작성자에게 새로운 댓글 알림
     */
    const receiver__id = data.post__id ? newReply.post.authorId : parentReply.post.authorId;
    if (jwtPayload.id !== receiver__id) {
      await this.#notification.send({
        recipients: [{ id: receiver__id }],
        message: `${user.name}${MY_POST_REPLY} "${newReply.content}"`,
        url: data.post__id ? newReply.post.deepLinkUrl : parentReply.post.deepLinkUrl,
        relationId: data.post__id ? data.post__id : parentReply.postId,
        type: NotificationType.COMMUNITY_COMMEND,
      });
    }

    return newReply;
  }

  @Mutation(returns => CommunityPostReply, { description: "커뮤니티 게시물 댓글 수정" })
  @UseGuards(JwtGuard)
  async updateCommunityPostReply(
    @Args("id", { type: () => ID }) id: string,
    @Args("data") data: CommunityPostReplyUpdateInput,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostReplyEntity> {
    const reply = await this.#communityPostReplyService.findOne(id);
    if (reply === null) {
      throw new NotFoundGraphQLError();
    } else if (reply.authorId !== jwtPayload.id) {
      throw new NotFoundGraphQLError();
    }
    const { usertag__ids, ...otherData } = data;
    const updatedReply = await this.#communityPostReplyService.updateOne(id, {
      ...otherData,
      usertags:
        usertag__ids != null
          ? usertag__ids.map(userId => {
            return { id: userId };
          })
          : undefined
    });

    await this.#pubSub.publish(COMMUNITY_POST_REPLY_RECEIVED, updatedReply);
    return updatedReply;
  }

  @Mutation(returns => CommunityPostReply, { description: "커뮤니티 게시물 댓글 단일 삭제" })
  @UseGuards(JwtGuard)
  async deleteCommunityPostReply(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostReplyEntity> {
    const reply = await this.#communityPostReplyService.findOne(id);
    if (reply === null) {
      throw new NotFoundGraphQLError();
    } else if (reply.authorId !== jwtPayload.id) {
      throw new NotFoundGraphQLError();
    }
    const deletedReply = await this.#communityPostReplyService.deleteOne(id);
    if (deletedReply.post?.id) {
      await this.#communityPostService.decrementReplyCount(deletedReply.postId);
    }
    await this.#pubSub.publish(COMMUNITY_POST_REPLY_RECEIVED, deletedReply);
    return deletedReply;
  }

  @Mutation(returns => [CommunityPostReply], { description: "커뮤니티 게시물 댓글 복수 삭제 - 관리자용" })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteManyCommunityPostRepliesForAdmin(
    @Args("ids", { type: () => [ID] }) ids: string[]
  ): Promise<CommunityPostReplyEntity[]> {
    const result = await this.#communityPostReplyService.deleteMany(ids);
    for await (const reply of result) {
      if (reply.post) {
        await this.#communityPostService.decrementReplyCount(reply.post.id);
      }
    }
    return result;
  }

  @Mutation(returns => CommunityPostReply, { description: "커뮤니티 게시물 댓글 좋아요" })
  @UseGuards(JwtGuard)
  async addCommunityPostReplyLike(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostReplyEntity> {
    const user = await this.#userService.findOne(jwtPayload.id);
    const updatedReply = await this.#communityPostReplyService.addLike(id, user.id);
    let postByparent: CommunityPostReplyEntity = null;
    if (!updatedReply.postId && updatedReply.parentId) {
      postByparent = await this.#communityPostReplyService.findOne(updatedReply.parentId, ["post"]);
    }
    await this.#pubSub.publish(COMMUNITY_POST_REPLY_RECEIVED, updatedReply);

    /**
     * 해당 댓글 작성자에게 좋아요 알림
     */
    if (jwtPayload.id !== updatedReply.authorId) {
      await this.#notification.send({
        recipients: [{ id: updatedReply.authorId }],
        message: `${user.name}${MY_REPLY_LIKE}`,
        url: updatedReply.postId ? updatedReply.post.deepLinkUrl : postByparent.post.deepLinkUrl,
        relationId: updatedReply.postId ? updatedReply.postId : postByparent.post.id,
        type: NotificationType.COMMUNITY_POST,
      });
    }

    return updatedReply;
  }

  @Mutation(returns => CommunityPostReply, { description: "커뮤니티 게시물 댓글 좋아요 취소(제거)" })
  @UseGuards(JwtGuard)
  async deleteCommunityPostReplyLike(
    @Args("id", { type: () => ID }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
  ): Promise<CommunityPostReplyEntity> {
    const updatedReply = await this.#communityPostReplyService.deleteLike(id, jwtPayload.id);
    return updatedReply;
  }

  @Subscription(returns => CommunityPostReply, {
    description: "커뮤니티 게시물 댓글 수신",
    filter(this: CommunityPostReplyResolver, payload: CommunityPostReplyEntity, variables: { rootId: string }) {
      return payload.postId === variables.rootId || payload.parentId === variables.rootId;
    },
    resolve: value => value
  })
  @UseGuards(JwtGuard)
  async receiveCommunityPostReply(
    @Args("rootId", { type: () => ID, description: "상위 field 고유 id" }) rootId: string
  ): Promise<AsyncIterator<unknown, unknown, undefined>> {
    return this.#pubSub.asyncIterator(COMMUNITY_POST_REPLY_RECEIVED);
  }

  @ResolveField(returns => [CommunityPostReply], { description: "대댓글 조회", nullable: true })
  async replies(@Parent() reply: CommunityPostReply): Promise<CommunityPostReplyEntity[]> {
    return await this.#communityPostReplyByParentReplyLoader.get(reply.id);
  }

  @ResolveField(returns => Boolean, { description: "(대)댓글 좋아요 여부", nullable: true })
  @UseGuards(JwtGuard)
  async isLike(
    @Parent() reply: CommunityPostReply,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload
   ): Promise<boolean> {
    return (await this.#communityPostReplyForLikeLoader.get({ usersId: jwtPayload.id, communityPostRepliesId: reply.id }))
      ? true
      : false;
  }

  @ResolveField(returns => [User], { description: "사용자 태그", nullable: true })
  @UseGuards(JwtGuard)
  async usertags(@Parent() communityPostReply: CommunityPostReply): Promise<UserEntity[]> {
    return (await this.#communityPostReplyBasicLoader.get(communityPostReply.id)).usertags;
  }

  @ResolveField(returns => User, { description: "작성자", nullable: true })
  @UseGuards(JwtGuard)
  async author(@Parent() communityPostReply: CommunityPostReply): Promise<UserEntity> {
    return (await this.#communityPostReplyBasicLoader.get(communityPostReply.id)).author;
  }

  // @ResolveField(returns => CommunityPost, { description: "댓글단 게시물", nullable: true })
  // @UseGuards(JwtGuard)
  // async post(@Parent() communityPostReply: CommunityPostReply): Promise<CommunityPostEntity> {
  //   return (await this.#communityPostReplyBasicLoader.get(communityPostReply.id))?.post;
  // }

  @ResolveField(returns => CommunityPostReply, { description: "대댓글단 댓글", nullable: true })
  @UseGuards(JwtGuard)
  async parent(@Parent() communityPostReply: CommunityPostReply): Promise<CommunityPostReplyEntity> {
    return (await this.#communityPostReplyBasicLoader.get(communityPostReply.id))?.parent;
  }
}
