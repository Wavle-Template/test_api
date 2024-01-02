/**
 * @module UserModule
 */
import { Args, ID, Info, Int, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { BadRequestGraphQLError, ForbiddenGraphQLError, InternalServerGraphQLError, NotFoundGraphQLError, PhoneNumber } from "@yumis-coconudge/common-module";
import { ApolloError, AuthenticationError, UserInputError } from "apollo-server-fastify";
import dedent from "dedent";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { SignUpInput, UserUpdateInput } from "./user.input";
import { SignUpResult, UserList, UserSearchResult } from "./user.model";
import { UserService } from "./user.service";
import { UserListArgs } from "./user.args";
import { UseGuards } from "@nestjs/common";
import { UserLoader } from "./user.loader";
import { Edge } from "@yumis-coconudge/typeorm-helper";
import { UserEntity } from "@app/entity";
import { User } from "@app/user/user.model";
import { AuthTokenService } from "@app/auth/token/token.service";
import { UserAuthService } from "@app/auth/role.auth.service";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { AuthTokenResponse } from "@app/auth/token/response.model";
import { ConfigService } from "@nestjs/config";
import { getConnection } from "typeorm";
import { SleeperService } from "./sleeper/sleeper.service";
import { PhoneAuthService } from "@app/phone-auth/phone-auth.service";

/**
 * 사용자 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => User)
export class UserResolver {
  private userEntityColumns: string[]
  constructor(
    public userService: UserService,
    public authTokenService: AuthTokenService,
    public userAuthService: UserAuthService,
    public userLoader: UserLoader,
    public configeService: ConfigService,
    public sleeperService: SleeperService,
    public phoneAuthService: PhoneAuthService
  ) {
    this.userEntityColumns = getConnection().getMetadata(UserEntity).ownColumns.map(column => column.propertyName);
  }

  //#region Query
  @Query(returns => User, {
    description: dedent`
    나 자신의 사용자를 조회합니다.

    **에러 코드**
    - \`FORBIDDEN\`: 권한이 없습니다.
    - \`NOT_FOUND\`: 해당 사용자를 찾을 수 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async me(@CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
    const user = await this.userService.findOne(jwtPayload.id);
    return user;
  }

  @Query(returns => User, {
    description: dedent`
      특정 사용자를 조회합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
      - \`NOT_FOUND\`: 해당 사용자를 찾을 수 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async user(@Args("id", { type: () => ID, description: "사용자 ID" }) id: string): Promise<User> {
    const user = await this.userService.findOne(id);
    if (user == null) throw new NotFoundGraphQLError("해당 사용자를 찾을 수 없습니다.");
    return user;
  }

  @Query(returns => UserList, {
    description: dedent`
      사용자 목록을 가져옵니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async users(@Args() args: UserListArgs, @Info() info: GraphQLResolveInfo): Promise<Partial<UserList>> {
    const fields = graphqlFields(info);
    let result: Partial<UserList> = {
      totalCount: null,
      edges: null,
      pageInfo: null,
    };
    try {
      if ("totalCount" in fields) result.totalCount = await this.userService.countByFilterArgs(args);

      if ("edges" in fields || "pageInfo" in fields) result.edges = await this.userService.getEdges(args);

      if ("edges" in fields && "pageInfo" in fields)
        result.pageInfo = await this.userService.getPageInfo(result.edges as Edge<UserEntity>[], args);

      return result;
    } catch (e) {
      if (e instanceof SyntaxError) throw new ApolloError("잘못된 인자입니다.");
      throw e;
    }
  }
  //#endregion

  //#region Mutation
  @Mutation(returns => AuthTokenResponse, {
    description: dedent`
      사용자 이름(아이디)으로 로그인합니다.

      **에러 목록**
      - \`UNAUTHENTICATED\`: 아이디 또는 비밀번호가 틀렸습니다.
    `,
  })
  async signIn(
    @Args("loginId", { description: "로그인 ID" }) loginId: string,
    @Args("password", { description: "비밀번호" }) password: string,
  ): Promise<AuthTokenResponse> {

    const loginField = this.configeService.get<"email" | "name">("login_field") ?? "email";

    if (!this.userEntityColumns.includes(loginField)) {
      throw new InternalServerGraphQLError("내부오류", "INVALID_LOGIN_FIELD");
    }

    const escapedLoginId = loginId.replace(/\s|\t|\r|\n/g, "");
    const escapedPassword = password.replace(/\s|\t|\r|\n/g, "");
    const authToken = loginField === "email" ? await this.userAuthService.loginEmailPassword(escapedLoginId, escapedPassword) : await this.userAuthService.loginNamePassword(escapedLoginId, escapedPassword);

    if (authToken == null) {
      const sleeper = loginField === "email" ? await this.sleeperService.loginEmailPassword(escapedLoginId, escapedPassword) : await this.sleeperService.loginNamePassword(escapedLoginId, escapedPassword);
      if (sleeper !== null) throw new AuthenticationError("휴면 계정입니다.", { userId: sleeper.userId });
      throw new AuthenticationError("아이디 또는 비밀번호가 틀렸습니다.");
    }


    return {
      accessToken: authToken.access_token,
      expiresIn: authToken.expires_in,
      refreshToken: authToken.refresh_token,
      tokenType: authToken.token_type,
    };
  }

  @Mutation(returns => SignUpResult, {
    description: dedent`
    회원가입하여 사용자를 생성합니다. email 또는 name이 반드시 있어야합니다.

    **에러 목록**
    - \`BAD_USER_INPUT\` (EMAIL_OR_NAME_REQUIRED): email 또는 name이 반드시 있어야합니다.
    - \`BAD_USER_INPUT\`: 데이터 유효성 검증 에러
    `,
  })
  async signUp(@Args("data", { description: "회원가입 데이터" }) data: SignUpInput): Promise<SignUpResult> {
    const loginField = this.configeService.get("login_field") ?? "email";

    if (!this.userEntityColumns.includes(loginField)) {
      throw new InternalServerGraphQLError("내부오류", "INVALID_LOGIN_FIELD");
    } else if (data[loginField] == null)
      throw new UserInputError(`${loginField} 반드시 있어야합니다.`, { detail: "EMAIL_OR_NAME_REQUIRED" });

    const tempData = {
      ...data,
      role: "MEMBER",
      email: data.email !== null ? data.email.replace(/\s|\t|\r|\n/g, "") : null,
      name: data.name != null ? data.name.replace(/\s|\t|\r|\n/g, "") : null,
      password: data.password != null ? data.password.replace(/\s|\t|\r|\n/g, "") : null,
    };

    const user = await this.userService.createOne(tempData);
    const authToken = await this.authTokenService.generate(user.id);

    return {
      user: user,
      token: {
        accessToken: authToken.access_token,
        expiresIn: authToken.expires_in,
        refreshToken: authToken.refresh_token,
        tokenType: authToken.token_type,
      },
    };
  }

  @Mutation(returns => User, {
    description: dedent`
      나 자신의 사용자 정보를 수정합니다.

      **에러 코드**
      - FORBIDDEN: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async updateMe(@Args("data") data: UserUpdateInput, @CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
    const tempData = { ...data };
    if (tempData.name != null) tempData.name = data.name.replace(/\s|\t|\r|\n/g, "");

    return await this.userService.updateOne(jwtPayload.id, tempData);
  }

  @Mutation(returns => User, {
    description: dedent`
      내 휴대폰 번호를 수정합니다.

      **에러 코드**
      - FORBIDDEN: 권한이 없습니다.
      - BAD_REQUEST: 잘못된 요청 혹은 인증 시간이 초과되었습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async updateMyPass(
    @Args("phoneNumber", { type: () => PhoneNumber }) phoneNumber: string,
    @Args("requestId", { type: () => ID, description: "휴대폰 인증 후 발급받은 고유 코드" }) requestId: string,
    @Args("newPassword", { type: () => String, description: "새로운 비밀번호" }) newPassword: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload) {

    const user = await this.userService.findOne(jwtPayload.id, ["socials"]);
    if (user.phoneNumber !== phoneNumber) throw new ForbiddenGraphQLError();
    else if (user.socials.length > 0) throw new BadRequestGraphQLError("소셜로 가입된 계정입니다");
    else if (user.salt === null || user.password === null) throw new BadRequestGraphQLError("비밀번호 변경이 불가한 계정입니다.");

    const check = await this.phoneAuthService.validateRequestId(phoneNumber, requestId);
    if (check !== true) throw new BadRequestGraphQLError("잘못된 요청 혹은 인증 시간이 초과되었습니다.");

    const updatedUser = await this.userService.updateOne(user.id, {
      password: newPassword.replace(/\s|\t|\r|\n/g, "")
    })

    await this.phoneAuthService.expireRequestId(phoneNumber);
    return updatedUser;
  }

  @Mutation(returns => [UserSearchResult], {
    description: dedent`
      검색 엔진을 이용하여 사용자를 검색합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async searchUser(@Args("keyword") keyword: string): Promise<UserSearchResult[]> {
    return await this.userService.search(keyword);
  }
  @Mutation(returns => User, {
    description: dedent`
      휴면 상태를 해제합니다.

      **에러 코드**
      - NOT_FOUND: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async wakeUpSleeper(@Args("userId", { type: () => ID }) userId: string) {
    try {
      await this.sleeperService.wakeUp(userId);
    } catch (error) {
      if (error instanceof Error && error.message === "NOT_FOUND_SLEEPER") throw new NotFoundGraphQLError();
      throw error
    }
  }

  //#endregion

  //#region ResolveField

  @ResolveField(returns => [User], { nullable: "items", description: "해당 사용자가 팔로우하는 사람 기록" })
  async followees(@Args("limit", { type: () => Int, defaultValue: 5 }) limit: number, @Parent() user: User) {
    return await this.userLoader.getFollowees(user.id, limit);
  }

  @ResolveField(returns => Boolean, { nullable: true, description: "내가 해당 사용자를 팔로잉한 여부" })
  async isFollowing(@Parent() user: User, @CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
    if (jwtPayload == null) return null;
    return this.userLoader.isFollowing(user.id, jwtPayload.id);
  }
  //#endregion
}
