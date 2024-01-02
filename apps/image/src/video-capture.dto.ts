import fs from "fs";
import { IsDefined, IsInt, IsPositive, IsString, ValidateIf } from "class-validator";

export class VideoCaptureDto {
  @IsDefined({ message: "sourcePath가 없습니다." })
  @IsString({ message: "sourcePath는 문자열이어야 합니다." })
  @ValidateIf((dto: VideoCaptureDto) => fs.existsSync(dto.sourcePath), {
    message: "sourcePath가 존재하지 않은 파일입니다.",
  })
  sourcePath: string;

  @IsDefined({ message: "targetPath가 없습니다." })
  @IsString({ message: "targetPath는 문자열이어야합니다." })
  targetPath: string;

  @IsDefined({ message: "timestamp 없습니다." })
  @IsInt({ message: "timestamp는 정수이어야 합니다." })
  @IsPositive({ message: "timestamp 0보다 커야 합니다." })
  timestamp: number;
}
