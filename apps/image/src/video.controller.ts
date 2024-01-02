import { Controller, Logger } from "@nestjs/common";
import { Ctx, MessagePattern, Payload, RmqContext } from "@nestjs/microservices";
import { Channel, Message } from "amqplib";
import { VideoCaptureDto } from "./video-capture.dto";
import { VideoService } from "./video.service";

@Controller()
export class VideoController {
  #logger = new Logger(VideoController.name);

  constructor(public videoService: VideoService) {}

  @MessagePattern("captureVideo")
  async captureVideo(@Payload() data: VideoCaptureDto, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef() as Channel;
    const originalMessage = context.getMessage() as Message;

    try {
      await this.videoService.captureVideo(data.sourcePath, data.targetPath, data.timestamp);
      channel.ack(originalMessage);
    } catch (e) {
      this.#logger.error(e);
      channel.reject(originalMessage);
    }
  }
}
