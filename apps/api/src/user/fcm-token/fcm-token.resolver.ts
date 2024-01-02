/**
 * @module UserFCMTokenModule
 */
import { CurrentJwtPayload } from "@app/auth/decorators/current-jwt-payload.decorator";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { FirebaseCloudMessagingService } from "@app/firebase";
import { User } from "@app/user/user.model";
import { UseGuards } from "@nestjs/common";
import { Args, Mutation, Parent, ResolveField, Resolver } from "@nestjs/graphql";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { ForbiddenError } from "apollo-server-fastify";
import dedent from "dedent";
import { UserFCMTokenAddInput } from "./fcm-token.input";
import { UserFCMTokenLoader } from "./fcm-token.loader";
import { UserFCMToken } from "./fcm-token.model";
import { UserFCMTokenService } from "./fcm-token.service";

/**
 * 사용자 FCM 토큰 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver(of => UserFCMToken)
export class UserFCMTokenResolver {
  constructor(public userFCMTokenService: UserFCMTokenService, public userFCMTokenLoader: UserFCMTokenLoader, public firebaseService: FirebaseCloudMessagingService) { }

  @Mutation(returns => UserFCMToken, {
    description: dedent`
      나 자신의 사용자에게 FCM 토큰을 추가합니다. 이미 추가된 적이 있는 토큰인 경우, 시간 갱신만 이루어집니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async setFCMToken(
    @Args("data", { description: "FCM 토큰 추가 데이터" }) data: UserFCMTokenAddInput,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ) {
    const result = await this.userFCMTokenService.set({ ...data, user: { id: jwtPayload.id } });
    await this.firebaseService.setTopic(data.fcmRegistrationToken, data.os)
    return result;
  }

  @Mutation(returns => UserFCMToken, {
    description: dedent`
      추가되있는 FCM 토큰을 삭제합니다. 내가 추가한 FCM 토큰만 가능합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard)
  async removeFCMToken(
    @Args("fcmRegistrationToken", { type: () => String, description: "FCM 등록 토큰" }) fcmRegistrationToken: string,
    @CurrentJwtPayload() jwtPayload: AuthTokenPayload,
  ) {
    const userDevice = await this.userFCMTokenService.findByFCMRegistrationToken(fcmRegistrationToken);
    if (userDevice == null) throw new NotFoundGraphQLError();
    if (userDevice.userId !== jwtPayload.id) throw new ForbiddenError("권한이 없습니다.");
    await this.firebaseService.delTopic(fcmRegistrationToken, userDevice.os)
    return this.userFCMTokenService.remove(fcmRegistrationToken);
  }

  @ResolveField(returns => User)
  async user(@Parent() userDevice: UserFCMToken) {
    return this.userFCMTokenLoader.getUser(userDevice.id);
  }
}
