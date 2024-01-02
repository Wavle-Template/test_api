import path from "path";
import ffmpeg from "fluent-ffmpeg";
import { Injectable } from "@nestjs/common";

@Injectable()
export class VideoService {
  async captureVideo(originalPath: string, targetPath: string, timestamp: number): Promise<void> {
    const dirPath = path.dirname(targetPath);
    const extname = path.extname(targetPath);
    const fileName = path.basename(targetPath, extname);

    await new Promise((resolve, reject) =>
      ffmpeg(originalPath)
        .on("error", reject)
        .on("end", resolve)
        .screenshot({
          folder: dirPath,
          filename: `${fileName}.png`,
          timestamps: [timestamp],
        }),
    );
  }
}
