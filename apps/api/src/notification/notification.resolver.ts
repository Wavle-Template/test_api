/**
 * @module NotificationModule
 */
import { Inject, UseGuards } from "@nestjs/common";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { ApolloError, ForbiddenError } from "apollo-server-fastify";
import graphqlFields from "graphql-fields";
import dedent from "dedent";
import { UserRole } from "@app/entity";
import { UserService } from "../user/user.service";
import { NotificationArgs, NotificationMixedArgs } from "./notification.args";
import { Notification, NotificationList } from "../../../../libs/notification/src/notification.model";
import { NotificationService } from "./notification.service";
import { GraphQLResolveInfo } from "graphql";
import { Edge } from "@yumis-coconudge/typeorm-helper";
import { NotificationCreateInput } from "./notification.input";
import { NotificationLoader } from "./notification.loader";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { NOTIFICATION_UN_READ_REDIS } from "./notification.const";
import Redis from "ioredis";

/**
 * 알림 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => Notification)
export class NotificationResolver {
  private TTL_TIME = 60 * 60;
  constructor(
    public notificationService: NotificationService,
    public notificationLoader: NotificationLoader,
    public userService: UserService,
    @Inject(NOTIFICATION_UN_READ_REDIS)
    public unReadCntcacheManager: Redis,
  ) { }

  @Query(returns => Number, {
    description: dedent`
    본인이 읽지않은 알림 수
    `
  })
  @UseGuards(JwtGuard)
  async unReadNotificationCnt(
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<number> {
    let unReadCnt = await this.unReadCntcacheManager.get(jwtPayload.id);
    if (unReadCnt === null) {
      const cnt = await this.notificationService.countByUserId(jwtPayload.id, true);
      await this.unReadCntcacheManager.set(jwtPayload.id, cnt, "EX", this.TTL_TIME)
      return cnt;
    } else {
      try {
        return Number(unReadCnt)
      } catch (error) {
        const cnt = await this.notificationService.countByUserId(jwtPayload.id, true);
        return cnt;
      }
    }
  }

  @Query(returns => Notification, {
    description: dedent`
    알림을 조회합니다. 관리자가 아닌 사용자는 자신의 알림만 조회할 수 있습니다.

    **에러 코드**
    - \`FORBIDDEN\`: 권한이 없습니다.
    - \`NOT_FOUND\`: 해당 사용자를 찾을 수 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async notification(
    @Args("id", { type: () => ID, description: "알림 ID" }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<Notification> {
    const notification = await this.notificationService.findOne(id, ["recipients"]);
    if (notification === null) throw new NotFoundGraphQLError("찾을 수 없습니다.");

    // 권한 체크
    const currentUser = await this.userService.findOne(jwtPayload.id);
    if (
      currentUser.role !== UserRole.ADMIN &&
      notification.recipients != null &&
      notification.recipients.some(recipient => recipient.id === jwtPayload.id) === false
    )
      throw new ForbiddenError("권한이 없습니다.");

    return notification as Notification;
  }

  @Query(returns => NotificationList, {
    description: dedent`
    내 알림 목록을 가져옵니다.

    [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
    `,
  })
  async myNotifications(
    @Args() args: NotificationArgs,
    @Args("unreadOnly", { type: () => Boolean, description: "읽지 않음만 보기" }) unreadOnly: boolean,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
    @Info() info: GraphQLResolveInfo,
  ) {
    const fields = graphqlFields(info);
    let result: Partial<NotificationList> = {
      totalCount: null,
      edges: null,
      pageInfo: null,
    };
    try {
      if ("totalCount" in fields)
        result.totalCount = await this.notificationService.countByUserId(jwtPayload.id, unreadOnly);

      if ("edges" in fields || "pageInfo" in fields)
        result.edges = (await this.notificationService.getEdgesByUserId(
          jwtPayload.id,
          args,
          unreadOnly,
        )) as Edge<Notification>[];

      if ("edges" in fields && "pageInfo" in fields)
        result.pageInfo = await this.notificationService.getPageInfoByUserId(
          jwtPayload.id,
          result.edges,
          args,
          unreadOnly,
        );

      return result;
    } catch (e) {
      if (e instanceof SyntaxError) throw new ApolloError("잘못된 인자입니다.");
      throw e;
    }
  }

  @Query(returns => NotificationList, {
    description: dedent`
      전체 알림 목록을 가져옵니다. 관리자만 허용됩니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async notificationsForAdmin(@Args() args: NotificationMixedArgs, @Info() info: GraphQLResolveInfo) {
    const fields = graphqlFields(info);
    let result: Partial<NotificationList> = {
      totalCount: null,
      edges: null,
      pageInfo: null,
    };
    try {
      if ("totalCount" in fields) result.totalCount = await this.notificationService.countByFilterArgs(args);

      if ("edges" in fields || "pageInfo" in fields)
        result.edges = (await this.notificationService.getEdges(args)) as Edge<Notification>[];

      if ("edges" in fields && "pageInfo" in fields)
        result.pageInfo = await this.notificationService.getPageInfo(result.edges, args);

      return result;
    } catch (e) {
      if (e instanceof SyntaxError) throw new ApolloError("잘못된 인자입니다.");
      throw e;
    }
  }

  @Mutation(returns => Notification, {
    description: dedent`
      임의 알림을 생성합니다. 관리자만 허용됩니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async sendNotificationForAdmin(@Args("data", { description: "알림 생성 데이터" }) data: NotificationCreateInput) {
    return this.notificationService.send({
      ...data,
      isCreatedForAdmin: true,
      recipients: data.recipientIds?.map(id => ({ id: id })),
    });
  }

  @Mutation(returns => Notification, {
    description: dedent`
      특정 알림을 읽음 처리합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`NOT_FOUND\`: 해당 사용자를 찾을 수 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async readNotification(
    @Args("id", { type: () => ID, description: "알림 ID" }) id: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ) {
    const notification = await this.notificationService.findOne(id, ["recipients"]);
    if (notification === null) throw new NotFoundGraphQLError("찾을 수 없습니다.");

    // 권한 체크
    const currentUser = await this.userService.findOne(jwtPayload.id);
    if (
      currentUser.role !== UserRole.ADMIN &&
      notification.recipients != null &&
      notification.recipients.some(recipient => recipient.id === jwtPayload.id) === false
    )
      throw new ForbiddenError("권한이 없습니다.");

    const readResult = await this.notificationService.read(jwtPayload.id, id);
    const cnt = await this.notificationService.countByUserId(jwtPayload.id, true);
    await this.unReadCntcacheManager.set(jwtPayload.id, cnt, "EX", this.TTL_TIME)
    return readResult;
  }

  @Mutation(returns => Number, {
    description: dedent`
      모든 알림을 읽음 처리합니다.

      읽음처리한 개수를 반환
    `,
  })
  @UseGuards(JwtGuard)
  async readAllNotification(
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ) {

    const edges = await this.notificationService.getEdgesByUserId(jwtPayload.id, {}, true);
    for await (const edge of edges) {
      await this.notificationService.read(jwtPayload.id, edge.node.id);
    }
    const cnt = await this.notificationService.countByUserId(jwtPayload.id, true);
    await this.unReadCntcacheManager.set(jwtPayload.id, cnt, "EX", this.TTL_TIME)
    return edges.length;
  }

  @ResolveField(returns => Boolean, { description: "해당 알림 읽음 여부" })
  @UseGuards(JwtGuard)
  async isRead(
    @Parent() notification: Notification,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ): Promise<boolean> {
    return this.notificationLoader.isRead(notification.id, jwtPayload.id);
  }
}
