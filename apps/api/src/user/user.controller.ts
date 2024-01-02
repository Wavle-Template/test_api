/**
 * @module UserModule
 */
import { UserAuthService } from "@app/auth/role.auth.service";
import { AuthTokenResponse } from "@app/auth/token/response.interface";
import { Body, Controller, Post, UnauthorizedException } from "@nestjs/common";
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger";
import { UserNamePasswordDto } from "./user.dto";

/**
 * 사용자 컨트롤러
 * @description OpenAPI 문서를 참고하세요.
 * @category Provider
 */
@Controller("user")
@ApiTags("user")
export class UserController {
  constructor(public userAuthService: UserAuthService) {}

  /**
   * /user/login
   */
  @Post("login")
  @ApiOperation({
    operationId: "login",
    summary: "로그인",
    description: "사용자 이름(아이디)와 비밀번호로 로그인합니다.",
  })
  @ApiBody({ description: "로그인에 필요한 데이터", type: UserNamePasswordDto })
  @ApiOkResponse({ description: "인증에 사용되는 토큰" })
  @ApiUnauthorizedResponse({ description: "아이디 또는 비밀번호가 틀렸습니다." })
  async login(@Body() { name, password }: UserNamePasswordDto): Promise<AuthTokenResponse> {
    const escapedName = name.replace(/\s|\t|\r|\n/g, "");
    const escapedPassword = password.replace(/\s|\t|\r|\n/g, "");
    const response = await this.userAuthService.loginNamePassword(escapedName, escapedPassword);
    if (response == null) throw new UnauthorizedException("아이디 또는 비밀번호가 틀렸습니다.");

    return response;
  }
}
