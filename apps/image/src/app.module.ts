import { Logger, Module } from "@nestjs/common";
import { ImageService } from "./image.service";
import { VideoService } from "./video.service";
import { ImageController } from "./image.controller";
import { VideoController } from "./video.controller";

@Module({
  providers: [ImageService, VideoService],
  controllers: [ImageController, VideoController],
})
export class AppModule {
  constructor(){
    const logger:Logger = new Logger("Server Name");
    logger.debug("Image Server Start!!!")
  }
}
