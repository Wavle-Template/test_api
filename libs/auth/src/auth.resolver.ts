/**
 * @module AuthModule
 */
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { AuthenticationError } from "apollo-server-fastify";
import dedent from "dedent";
import { AuthService } from "./auth.service";
import { AuthTokenPayload } from "./token/payload.interface";
import { AuthTokenResponse } from "./token/response.model";
import { AuthTokenService } from "./token/token.service";
import { AuthTokenType } from "./token/token.enum";
import { LastLoginService } from "./last.login.service";

/**
 * 인증 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver()
export class AuthResolver {
  constructor(
    public jwtService: JwtService,
    public authService: AuthService,
    public authTokenService: AuthTokenService,
    public lastLoginService: LastLoginService
  ) {}

  @Mutation(returns => AuthTokenResponse, {
    description: dedent`
      갱신 토큰으로 토큰을 새로 발급받습니다. 갱신 토큰도 일정 기간이 지난 경우에는 새로 발급됩니다.

      **에러 코드**
      - \`UNAUTHENTICATED\`: 만료된 갱신 토큰입니다.
    `,
  })
  async refreshToken(
    @Args("refreshToken", { description: "갱신 토큰" }) refreshToken: string,
  ): Promise<AuthTokenResponse> {
    if ((await this.authTokenService.validate(refreshToken, AuthTokenType.RefreshToken)) === false)
      throw new AuthenticationError("만료된 갱신 토큰입니다.");

    const payload = this.jwtService.decode(refreshToken) as AuthTokenPayload;
    if (this.authTokenService.isAvailableRefreshing(refreshToken)) {
      refreshToken = this.authTokenService.generateRefreshToken(payload.sub);
    }

    const response = await this.authTokenService.generate(payload.sub, refreshToken);
    await this.lastLoginService.updateLastLoginAt(payload.id);
    return {
      tokenType: "Bearer",
      accessToken: response.access_token,
      expiresIn: response.expires_in,
      refreshToken: response.refresh_token,
    };
  }
}
