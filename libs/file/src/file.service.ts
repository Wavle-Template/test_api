/**
 * @module FileModule
 */
import crypto from "crypto";
import path from "path";
import stream from "stream/promises";
import fs from "fs";
import { BadRequestException, Injectable, Logger } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { EntityManager, In } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { WHITELIST_EXTENSION_NAMES, WHITELIST_MIMETYPES } from "./file.const";
import { MultipartFile } from "fastify-multipart";
import { ModuleRef } from "@nestjs/core";
import type { DeepPartial } from "ts-essentials";
import { FileEntity } from "@app/entity";
import { MicroserviceImageService } from "@app/microservice";

/**
 * 파일을 관리하기위한 비지니스 로직 서비스
 * @category Provider
 */
@Injectable()
export class FileService {
  /** TypeORM 엔티티 매니저 */
  #entityManager: EntityManager;
  /** NestJS 컨픽 서비스 */
  #configService: ConfigService;
  /** 이미지 관련 마이크로서비스 */
  #imageService: MicroserviceImageService;
  /** 로거 */
  #logger: Logger;

  /**
   * @param entityManager TypeORM 엔티티 매니저
   * @param configService NestJS 컨픽 서비스
   * @param moduleRef NestJS ModuleRef (이미지 관련 마이크로서비스를 주입하기 위함)
   */
  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    configService: ConfigService,
    moduleRef: ModuleRef,
    logger: Logger,
  ) {
    this.#entityManager = entityManager;
    this.#configService = configService;
    this.#imageService = moduleRef.get(MicroserviceImageService, { strict: false });
    this.#logger = logger;

    const uploadPath = this.#configService.get("FILE_UPLOAD_PATH");
    if (fs.existsSync(uploadPath) === false) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
  }

  /**
   * 프로토콜을 포함한 도메인 및 호스트네임, IP등 주소와 상대 경로를 합칩니다.
   * @param base 프로토콜을 포함한 도메인, IP 등 주소 (예시: https://www.google.com)
   * @param path 상대 경로 (예시: /search)
   * @returns URL 경로 (예시: https://www.google.com/search)
   */
  static getURL(base: string, path: string): string {
    return new URL(path, base).href;
  }

  /**
   * 데이터베이스로부터 파일을 단일 조회합니다.
   * @param id 조회할 DB에 기록된 파일의 ID
   * @returns 파일 엔티티
   */
  async findOne(id: string): Promise<FileEntity> {
    return this.#entityManager.findOne(FileEntity, id);
  }

  /**
   * 데이터베이스로부터 파일을 다중 조회합니다.
   * @param ids 조회할 DB에 기록된 파일의 ID 목록
   * @returns 파일 엔티티 목록
   */
  async findByIds(ids: string[]): Promise<FileEntity[]> {
    return this.#entityManager.find(FileEntity, { id: In(ids) });
  }

  /**
   * 데이터베이스로부터 파일의 데이터를 수정합니다.
   * @param id 수정할 DB에 기록된 파일의 ID
   * @param data 수정할 파일 엔티티의 데이터
   * @returns 수정된 파일 엔티티
   */
  async update(id: string, data: DeepPartial<FileEntity>): Promise<FileEntity> {
    return this.#entityManager.transaction(async manager => {
      let file = await manager.findOneOrFail(FileEntity, id);
      file = manager.merge(FileEntity, file, data);

      return await manager.save(file);
    });
  }

  /**
   * 파일을 스트림 형태로 불러옵니다.
   * @param path 불러올 파일의 경로
   * @returns 불러올 파일의 스트림
   */
  read(path: string, start?: number, end?: number): fs.ReadStream {
    return fs.createReadStream(path, { start: start, end: end });
  }

  /**
   * 파일을 저장합니다.
   * @param uploadFile 업로드한 파일
   * @returns 저장된 파일 엔티티
   */
  async write(uploadFile: MultipartFile, priority = 0): Promise<FileEntity> {
    const uploadPath = this.#configService.get("FILE_UPLOAD_PATH");
    const extname = path.extname(uploadFile.filename).toLowerCase().substring(1);

    if (WHITELIST_MIMETYPES.includes(uploadFile.mimetype) !== true)
      throw new BadRequestException("허용되지 않은 파일 형식입니다.");
    if (WHITELIST_EXTENSION_NAMES.includes(extname) !== true)
      throw new BadRequestException("허용되지 않은 파일 형식입니다.");

    const tempName = `${crypto.randomBytes(16).toString("hex")}.${extname}`;
    const tempPath = path.join(process.cwd(), uploadPath, tempName);
    await stream.pipeline(uploadFile.file, fs.createWriteStream(tempPath));

    const hash = crypto.createHash("md5");
    await stream.pipeline(fs.createReadStream(tempPath), hash);
    const md5 = hash.digest("hex");

    const targetPath = path.join(process.cwd(), uploadPath, `${md5}.${extname}`);
    if (fs.existsSync(targetPath) === false) await fs.promises.rename(tempPath, targetPath);
    else fs.promises.rm(tempPath);

    const size = (await fs.promises.stat(targetPath)).size;
    return await this.#entityManager.transaction(async manager => {
      let file = manager.create(FileEntity, {
        filename: uploadFile.filename,
        mimetype: uploadFile.mimetype,
        size: size,
        md5: md5,
        priority: priority,
        relativePath: path.join(uploadPath, `${md5}.${extname}`),
      });
      file = await manager.save(file);

      if (file.mimetype == null) return file;

      let fileType: string;
      if (file.mimetype === "application/octet-stream") {
        switch (extname) {
          case "mov":
            fileType = "video";
            break;
        }
      } else {
        fileType = file.mimetype.split("/")[0];
      }

      try {
        switch (fileType) {
          case "image":
            await Promise.all([
              this.#imageService.resizeThumbnail(file.id, file.relativePath),
              this.#imageService.resizeLow(file.id, file.relativePath),
              this.#imageService.resizeHigh(file.id, file.relativePath),
            ]);
            break;
          case "video":
            await this.#imageService.captureVideoScreenshot(file.id, file.relativePath);
            const videoScreenshotPath = path.join(uploadPath, `${md5}.png`);
            await Promise.all([
              this.#imageService.resizeThumbnail(file.id, videoScreenshotPath),
              this.#imageService.resizeLow(file.id, videoScreenshotPath),
              this.#imageService.resizeHigh(file.id, videoScreenshotPath),
            ]);
            break;
        }
      } catch (e) {
        this.#logger.error("마이크로서비스에 오류가 발생하였습니다. 추가 파일 처리는 무시됩니다.");
      }

      return await manager.findOne(FileEntity, file.id);
    });
  }

  async setPriority(fileIds: string[], transactionManager?: EntityManager) {
    const runInTransaction = async (manage) => {
      const files = await manage.find(FileEntity, { where: { id: In(fileIds) } });
      let inputItems = files.filter(file => fileIds.some(id => id === file.id));
      inputItems = fileIds.map((id, idx) => ({ ...inputItems.find(item => item.id === id), priority: idx }));
      return await manage.save(FileEntity, inputItems);
    }
    if (transactionManager != null) return runInTransaction(transactionManager);
    else return this.#entityManager.transaction(manage => runInTransaction(manage));
  }
}
