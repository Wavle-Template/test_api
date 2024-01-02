import { Injectable } from "@nestjs/common";
import sharp from "sharp";

@Injectable()
export class ImageService {
  async resize(originalPath: string, targetPath: string, targetHeight: number): Promise<void> {
    const metadata = await sharp(originalPath).metadata();
    const isLandscape = (metadata.width ?? 0) >= (metadata.height ?? 0);

    const resizeOption = (quality: number) => {
      if (isLandscape === true) return { height: quality };
      else return { width: quality };
    };

    await sharp(originalPath).resize(resizeOption(targetHeight)).jpeg({ quality: 100 }).toFile(targetPath);
  }
}
