/**
 * @module AuthModule
 */
import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { AuthRefreshDto, AuthTokenResponseDto } from "./auth.dto";
import { AuthTokenPayload } from "./token/payload.interface";
import { AuthTokenResponse } from "./token/response.interface";
import { AuthTokenService } from "./token/token.service";
import { AuthService } from "./auth.service";
import { JwtService } from "@nestjs/jwt";
import { AuthTokenType } from "./token/token.enum";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { LastLoginService } from "./last.login.service";

/**
 * 인증 컨트롤러
 * @description OpenAPI 문서를 참고하세요.
 * @category Provider
 */
@Controller("auth")
@ApiTags("auth")
export class AuthController {
  constructor(
    public jwtService: JwtService,
    public authService: AuthService,
    public authTokenService: AuthTokenService,
    public lastLoginService: LastLoginService
  ) { }

  @Post("refresh")
  @ApiOperation({ operationId: "refreshToken", summary: "토큰 갱신", description: "토큰을 갱신합니다." })
  @ApiBody({ description: "토큰 갱신에 필요한 데이터", type: AuthRefreshDto })
  @ApiOkResponse({ description: "갱신된 토큰", type: AuthTokenResponseDto })
  @ApiUnauthorizedResponse({ description: "만료된 갱신 토큰입니다." })
  async refresh(@Body() { refresh_token }: AuthRefreshDto): Promise<AuthTokenResponse> {
    if ((await this.authTokenService.validate(refresh_token, AuthTokenType.RefreshToken)) === false)
      throw new UnauthorizedException("만료된 갱신 토큰입니다.");

    const payload = this.jwtService.decode(refresh_token) as AuthTokenPayload;

    let refreshToken = refresh_token;
    if (this.authTokenService.isAvailableRefreshing(refreshToken) === true) {
      refreshToken = this.authTokenService.generateRefreshToken(payload.sub);
    }
    const authResponse = await this.authTokenService.generate(payload.sub, refreshToken);
    await this.lastLoginService.updateLastLoginAt(payload.id);
    return authResponse
  }
}
