/**
 * 마이크로서비스를 이용해 이미지를 처리합니다.
 *
 * ## 다이어그램
 * ```mermaid
 * classDiagram
 * ClientsModule --> MicroserviceImageModule : Import
 * FileModule --> MicroserviceImageModule : Import
 * MicroserviceImageModule o-- MicroserviceImageService : Provide
 * MicroserviceImageModule o-- Logger : Provide
 * MicroserviceImageService <.. ClientProxy : Inject
 * MicroserviceImageService <.. FileService : Inject
 * ```
 * @module MicroserviceImageModule
 */
import { FileModule } from "@app/file";
import { forwardRef, Inject, Logger, Module, OnApplicationBootstrap } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { ClientProxy, ClientsModule, Transport } from "@nestjs/microservices";
import { MICROSERVICE_IMAGE_QUEUE } from "./image.const";
import { MicroserviceImageService } from "./image.service";

/**
 * 마이크로서비스 이미지 모듈
 * @hidden
 */
@Module({
  imports: [
    ClientsModule.registerAsync([
      {
        name: MICROSERVICE_IMAGE_QUEUE,
        imports: [ConfigModule],
        inject: [ConfigService],
        useFactory: (configService: ConfigService) => {
          const rabbitMQURL = configService.get<string>("RABBITMQ_URL");
          return {
            transport: Transport.RMQ,
            options: {
              urls: [rabbitMQURL],
              queue: "image_queue",
              queueOptions: { durable: true },
            },
          };
        },
      },
    ]),
    forwardRef(() => FileModule),
  ],
  providers: [
    {
      provide: Logger,
      useValue: new Logger(MicroserviceImageModule.name),
    },
    MicroserviceImageService,
  ],
  exports: [MicroserviceImageService],
})
export class MicroserviceImageModule implements OnApplicationBootstrap {
  /**
   * @hidden
   */
  #logger: Logger;
  /**
   * @hidden
   */
  #imageQueueClient: ClientProxy;

  /**
   * @hidden
   */
  constructor(@Inject(MICROSERVICE_IMAGE_QUEUE) imageQueueClient: ClientProxy, logger: Logger) {
    this.#imageQueueClient = imageQueueClient;
    this.#logger = logger;
  }

  /**
   * @hidden
   */
  async onApplicationBootstrap(): Promise<void> {
    try {
      await this.#imageQueueClient.connect();
    } catch (e) {
      this.#logger.error("이미지 큐 마이크로서비스에 접속이 실패하였습니다.");
    }
  }
}
