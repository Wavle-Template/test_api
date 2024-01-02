/**
 * @module FileModule
 */
import path from "path";
import dedent from "dedent";
import { Args, Context, ID, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { FastifyRequest } from "fastify";
import { ConfigService } from "@nestjs/config";
import { NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import { FileEntity } from "@app/entity";
import { FileService, GraphQLFile } from "@app/file";

/**
 * 파일 리졸버
 * @category Provider
 */
@Resolver(of => GraphQLFile)
export class FileApiResolver {
  constructor(public configService: ConfigService, public fileService: FileService) {}

  @Query(returns => GraphQLFile, {
    description: dedent`
      파일의 정보를 조회합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 파일이 존재하지 않습니다.
    `,
  })
  async file(@Args("id", { type: () => ID, description: "파일 ID" }) id: string): Promise<GraphQLFile> {
    const file = await this.fileService.findOne(id);
    if (file == null) throw new NotFoundGraphQLError("파일이 존재하지 않습니다.");
    return file as GraphQLFile;
  }

  @ResolveField(returns => String, { description: "원본 URL" })
  url(@Parent() file: FileEntity, @Context() context: { req: FastifyRequest }): string {
    const baseURL = `${context.req.protocol}://${context.req.headers.host ?? context.req.hostname}`;
    const urlPrefix = this.configService.get("FILE_URL_PREFIX");
    return FileService.getURL(baseURL, path.join(urlPrefix, file.relativePath));
  }

  @ResolveField(returns => String, { description: "썸네일용 URL (240px)", nullable: true })
  thumbnailURL(@Parent() file: FileEntity, @Context() context: { req: FastifyRequest }): string | null {
    const baseURL = `${context.req.protocol}://${context.req.headers.host ?? context.req.hostname}`;
    const urlPrefix = this.configService.get("FILE_URL_PREFIX");
    return FileService.getURL(baseURL, path.join(urlPrefix, file.thumbnailPath));
  }

  @ResolveField(returns => String, { description: "저화질 URL (480px)", nullable: true })
  lowQualityURL(@Parent() file: FileEntity, @Context() context: { req: FastifyRequest }): string | null {
    const baseURL = `${context.req.protocol}://${context.req.headers.host ?? context.req.hostname}`;
    const urlPrefix = this.configService.get("FILE_URL_PREFIX");
    return FileService.getURL(baseURL, path.join(urlPrefix, file.lowQualityPath));
  }

  @ResolveField(returns => String, { description: "고화질 URL (1080px)", nullable: true })
  highQualityURL(@Parent() file: FileEntity, @Context() context: { req: FastifyRequest }): string | null {
    const baseURL = `${context.req.protocol}://${context.req.headers.host ?? context.req.hostname}`;
    const urlPrefix = this.configService.get("FILE_URL_PREFIX");
    return FileService.getURL(baseURL, path.join(urlPrefix, file.highQualityPath));
  }
}
