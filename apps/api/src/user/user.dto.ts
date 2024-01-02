/**
 * @module UserModule
 */
import { ApiProperty } from "@nestjs/swagger";
import { IsDefined } from "class-validator";

/**
 * 사용자 이름(아이디)/비밀번호 DTO
 * @category DTO
 */
export class UserNamePasswordDto {
  @IsDefined({ message: "아이디가 필요합니다." })
  @ApiProperty({ description: "고유 이름(아이디)" })
  name: string;

  @IsDefined({ message: "비밀번호가 필요합니다." })
  @ApiProperty({ description: "비밀번호" })
  password: string;
}
