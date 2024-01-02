/**
 * @module FileModule
 */

import path from "path";
import { BadRequestException, Controller, Get, Param, Post, Req, Res } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConsumes,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiTags,
} from "@nestjs/swagger";
import { FastifyReply, FastifyRequest } from "fastify";
import { FileEntity } from "@app/entity";
import { FileService } from "@app/file";
import { FileDto, FileUploadDto } from "@app/file/file.dto";

/**
 * 파일 컨트롤러
 * @description OpenAPI 문서를 참고하세요.
 * @category Provider
 */
@Controller("files")
@ApiTags("files")
export class FileApiController {
  constructor(public fileService: FileService, public configService: ConfigService) {}

  @Get("download/:id")
  @ApiOperation({
    operationId: "downloadFile",
    summary: "파일 다운로드",
    description: "DB에 기록된 파일을 조회하여 파일을 다운로드합니다.",
  })
  @ApiParam({ name: "id", description: "파일 ID" })
  @ApiOkResponse({ description: "다운로드할 파일" })
  async downloadFile(@Res() res: FastifyReply, @Param("id") id: string): Promise<FastifyReply> {
    const fileEntity = await this.fileService.findOne(id);
    return res
      .header("Content-Type", fileEntity.mimetype)
      .header("Content-Disposition", `attachment; filename=${fileEntity.filename}`)
      .header("Content-Length", fileEntity.size)
      .status(200)
      .send(this.fileService.read(fileEntity.relativePath));
  }

  @Post("upload")
  @ApiOperation({
    operationId: "uploadFile",
    summary: "파일 업로드",
    description: "파일을 서버에 업로드하고, DB에 데이터를 기록합니다.",
  })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    description: "업로드할 파일",
    type: FileUploadDto,
  })
  @ApiCreatedResponse({ description: "업로드된 파일의 정보", type: () => FileDto, isArray: true })
  @ApiBadRequestResponse({ description: "multipart/form-data 형식이 아닙니다. / 허용되지 않은 파일 형식입니다." })
  async uploadFile(@Req() req: FastifyRequest): Promise<FileDto[]> {
    if (req.isMultipart() === false) throw new BadRequestException("multipart/form-data 형식이 아닙니다.");
    
    const pending: Promise<FileEntity>[] = [];
    let i = 0;
    for await (const part of req.parts()) {
      pending.push(this.fileService.write(part, i));
      i++;
    }

    const baseURL = `${req.protocol}://${req.headers.host ?? req.hostname}`;
    const urlPrefix = this.configService.get("FILE_URL_PREFIX");
    const fileEntities = await Promise.all(pending);

    return fileEntities.map(fileEntity => ({
      id: fileEntity.id,
      filename: fileEntity.filename,
      mimetype: fileEntity.mimetype,
      md5: fileEntity.md5,
      size: fileEntity.size,
      priority: fileEntity.priority,
      createdAt: fileEntity.createdAt,
      deletedAt: fileEntity.deletedAt,
      url:
        fileEntity.relativePath != null
          ? FileService.getURL(baseURL, path.join(urlPrefix, path.basename(fileEntity.relativePath)))
          : null,
      thumbnailURL:
        fileEntity.thumbnailPath != null
          ? FileService.getURL(baseURL, path.join(urlPrefix, path.basename(fileEntity.thumbnailPath)))
          : null,
      lowQualityURL:
        fileEntity.lowQualityPath != null
          ? FileService.getURL(baseURL, path.join(urlPrefix, path.basename(fileEntity.lowQualityPath)))
          : null,
      highQualityURL:
        fileEntity.highQualityPath != null
          ? FileService.getURL(baseURL, path.join(urlPrefix, path.basename(fileEntity.highQualityPath)))
          : null,
    }));
  }
}
