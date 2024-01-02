/**
 * @module AppModule
 */
import fs from "fs";
import { DateTime } from "luxon";
import { Controller, ForbiddenException, Get } from "@nestjs/common";
import { ApiForbiddenResponse, ApiOkResponse, ApiOperation, ApiProperty, ApiTags } from "@nestjs/swagger";

class AppInfo {
  @ApiProperty({ description: "버전", example: "1.0.0" })
  version: string;

  @ApiProperty({ description: "시작 시간", example: "2022년 3월 29일 오후 7:35 GMT+9" })
  startDatetime: string;

  @ApiProperty({ description: "업타임", example: "1시간 전" })
  uptime: string;
}

/**
 * 앱 컨트롤러
 * @description OpenAPI 문서를 참고하세요.
 * @category Provider
 */
@Controller()
@ApiTags("info")
export class AppController {
  #information: Partial<AppInfo>;
  #startDateTime: DateTime;

  constructor() {
    if (process.env.NODE_ENV == null || process.env.NODE_ENV === "development") {
      const packageJson = JSON.parse(fs.readFileSync("./package.json", "utf-8"));
      this.#startDateTime = DateTime.now();
      this.#information = {
        version: packageJson.version,
        startDatetime: this.#startDateTime.setLocale("ko").toLocaleString(DateTime.DATETIME_FULL),
      };
    }
  }

  @Get("/")
  @ApiOperation({
    operationId: "getInfo",
    summary: "서버 정보",
    description: "서버 정보를 얻습니다. 이 API는 development 환경에서만 제공됩니다.",
  })
  @ApiOkResponse({ description: "서버 정보가 출력됩니다.", type: AppInfo })
  @ApiForbiddenResponse({ description: "development 환경이 아닙니다." })
  root(): AppInfo {
    if (this.#information == null) throw new ForbiddenException();
    const uptime = this.#startDateTime.setLocale("ko").toRelative();
    return {
      version: this.#information.version,
      startDatetime: this.#information.startDatetime,
      uptime: uptime.toString(),
    };
  }
}
