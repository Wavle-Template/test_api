/**
 * @module FileModule
 */

import { ApiProperty } from "@nestjs/swagger";

/**
 * 파일 업로드 DTO
 * @category DTO
 */
export class FileUploadDto {
  @ApiProperty({ type: "array", items: { type: "string", format: "binary" } })
  files: unknown;
}

/**
 * 파일 DTO
 * @category DTO
 */
export class FileDto {
  /** UUID */
  @ApiProperty({ description: "UUID", format: "uuid" })
  id: string;

  /** 원본 이름 */
  @ApiProperty({ description: "원본 이름" })
  filename: string;

  /** MIME 타입 */
  @ApiProperty({ description: "MIME 타입", example: "image/png" })
  mimetype: string;

  /** MD5 체크섬 */
  @ApiProperty({ description: "MD5 체크섬", example: "4de41eea6500db3bd8df4dd26ab4578d" })
  md5: string;
  /** 크기 (바이트) */
  @ApiProperty({ description: "크기 (바이트)" })
  size: number;

  /** 우선 순위 (정렬용) */
  @ApiProperty({ description: "우선 순위 (정렬용)" })
  priority: number;

  /** 생성 날짜/시간 */
  @ApiProperty({ description: "생성 날짜/시간" })
  createdAt: Date;

  /** 삭제 날짜/시간 */
  @ApiProperty({ description: "삭제 날짜/시간", required: false, example: null })
  deletedAt?: Date | null;

  /** 원본 URL */
  @ApiProperty({
    description: "원본 URL",
    required: false,
    example: "https://example.com/files/4de41eea6500db3bd8df4dd26ab4578d.png",
  })
  url: string | null;

  /** 썸네일 URL */
  @ApiProperty({
    description: "썸네일 URL",
    required: false,
    example: "https://example.com/files/4de41eea6500db3bd8df4dd26ab4578d_thumbnail.png",
  })
  thumbnailURL: string | null;

  /** 저화질 URL */
  @ApiProperty({
    description: "저화질 URL",
    required: false,
    example: "https://example.com/files/4de41eea6500db3bd8df4dd26ab4578d_low.png",
  })
  lowQualityURL: string | null;

  /** 고화질 URL */
  @ApiProperty({
    description: "고화질 URL",
    required: false,
    example: "https://example.com/files/4de41eea6500db3bd8df4dd26ab4578d_high.png",
  })
  highQualityURL: string | null;
}
