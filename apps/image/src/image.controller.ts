import { Controller, Logger } from "@nestjs/common";
import { Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { Channel, Message } from "amqplib";
import { ImageResizeDto } from "./image-resize.dto";
import { ImageService } from "./image.service";

@Controller()
export class ImageController {
  #logger = new Logger(ImageController.name);

  constructor(public imageService: ImageService) {}

  @MessagePattern("resize")
  async resize(@Payload() data: ImageResizeDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const originalMessage = context.getMessage() as Message;
    try {
      await this.imageService.resize(data.sourcePath, data.targetPath, data.targetHeight);
      channel.ack(originalMessage);
    } catch (e) {
      this.#logger.error(e);
      channel.reject(originalMessage);
    }
  }
}
