/**
 * @module MicroserviceImageModule
 */
import path from "path";
import { forwardRef, Inject, Injectable } from "@nestjs/common";
import { ClientProxy } from "@nestjs/microservices";
import { MICROSERVICE_IMAGE_QUEUE } from "./image.const";
import { FileService } from "@app/file";

/**
 * 이미지 처리 관련 마이크로서비스를 사용하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class MicroserviceImageService {
  /** 이미지 큐용 NestJS 마이크로서비스 클라이언트 */
  #imageQueueClient: ClientProxy;
  /** 파일 서비스 */
  #fileService: FileService;

  /**
   * @param imageQueueClient 이미지 큐용 NestJS 마이크로서비스 클라이언트
   * @param fileService 파일 서비스
   */
  constructor(
    @Inject(MICROSERVICE_IMAGE_QUEUE) imageQueueClient: ClientProxy,
    @Inject(forwardRef(() => FileService)) fileService: FileService,
  ) {
    this.#imageQueueClient = imageQueueClient;
    this.#fileService = fileService;
  }

  /**
   * 비디오의 스크린샷을 찍도록 마이크로서비스에 명령합니다.
   * @param sourcePath 비디오 파일의 경로
   * @param targetPath 저장할 스크린샷 파일의 경로
   * @param timestamp 스크린샷을 찍을 시간 위치
   */
  async #commandCaptureVideo(sourcePath: string, targetPath: string, timestamp: number): Promise<void> {
    return new Promise<void>((resolve, reject) =>
      this.#imageQueueClient
        .send("captureVideo", { sourcePath: sourcePath, targetPath: targetPath, timestamp: timestamp })
        .subscribe({
          error: err => reject(err),
          complete: () => resolve(),
        }),
    );
  }

  /**
   * 이미지의 해상도를 리사이징하도록 마이크로서비스에 명령합니다.
   * @param sourcePath 원본 이미지 파일의 경로
   * @param targetPath 저장할 이미지 파일의 경로
   * @param height 리사이징할 해상도 높이 값(px)
   */
  async commandResize(sourcePath: string, targetPath: string, height: number): Promise<void> {
    return new Promise<void>((resolve, reject) =>
      this.#imageQueueClient
        .send("resize", { sourcePath: sourcePath, targetPath: targetPath, targetHeight: height })
        .subscribe({
          error: err => reject(err),
          complete: () => resolve(),
        }),
    );
  }

  /**
   * 비디오에서 스크린샷을 찍습니다.
   * @param fileId DB에 기록된 파일의 ID
   * @param relativePath 비디오 파일의 상대 경로
   */
  async captureVideoScreenshot(fileId: string, relativePath: string): Promise<void> {
    const extName = path.extname(relativePath);
    const fileName = path.basename(relativePath, extName);
    const dirName = path.dirname(relativePath);
    const newPath = path.join(dirName, `${fileName}.png`);

    await this.#commandCaptureVideo(relativePath, newPath, 1);
    await this.#fileService.update(fileId, { videoScreenshotPath: newPath });
  }

  /**
   * 이미지 파일을 썸네일 크기(240px)로 리사이징합니다.
   * @param fileId DB에 기록된 파일의 ID
   * @param relativePath 원본 이미지 파일의 상대 경로
   */
  async resizeThumbnail(fileId: string, relativePath: string): Promise<void> {
    const extName = path.extname(relativePath);
    const fileName = path.basename(relativePath, extName);
    const dirName = path.dirname(relativePath);
    const newPath = path.join(dirName, `${fileName}_thumbnail.jpg`);

    await this.commandResize(relativePath, newPath, 240);
    await this.#fileService.update(fileId, { thumbnailPath: newPath });
  }

  /**
   * 이미지 파일을 저화질 크기(480px)로 리사이징합니다.
   * @param fileId DB에 기록된 파일의 ID
   * @param relativePath 원본 이미지 파일의 상대 경로
   */
  async resizeLow(fileId: string, relativePath: string): Promise<void> {
    const extName = path.extname(relativePath);
    const fileName = path.basename(relativePath, extName);
    const dirName = path.dirname(relativePath);
    const newPath = path.join(dirName, `${fileName}_low.jpg`);

    await this.commandResize(relativePath, newPath, 480);
    await this.#fileService.update(fileId, { lowQualityPath: newPath });
  }

  /**
   * 이미지 파일을 고화질 크기(1080px)로 리사이징합니다.
   * @param fileId DB에 기록된 파일의 ID
   * @param relativePath 원본 이미지 파일의 상대 경로
   */
  async resizeHigh(fileId: string, relativePath: string): Promise<void> {
    const extName = path.extname(relativePath);
    const fileName = path.basename(relativePath, extName);
    const dirName = path.dirname(relativePath);
    const newPath = path.join(dirName, `${fileName}_high.jpg`);

    await this.commandResize(relativePath, newPath, 1080);
    await this.#fileService.update(fileId, { highQualityPath: newPath });
  }
}
