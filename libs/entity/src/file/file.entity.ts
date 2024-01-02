/**
 * @module FileModule
 */
import { EssentialEntity } from "@yumis-coconudge/common-module";
import { Entity, Column } from "typeorm";

/**
 * 파일 엔티티
 * @category TypeORM Entity
 */
@Entity({
  name: "files",
  orderBy: {
    priority: "ASC",
    createdAt: "DESC",
    filename: "ASC",
    id: "ASC",
  },
})
export class FileEntity extends EssentialEntity {
  /** 원본 이름 */
  @Column({ nullable: true })
  filename?: string;

  /** MIME 타입 */
  @Column({ nullable: true })
  mimetype?: string;

  /** MD5 체크섬 */
  @Column({ nullable: true })
  md5?: string;

  /** 크기 (바이트) */
  @Column("integer", { nullable: true })
  size?: number;

  /** 원본 파일 상대 경로 */
  @Column({ nullable: true })
  relativePath?: string;

  /** 썸네일 이미지(240) 상대 경로 */
  @Column({ nullable: true })
  thumbnailPath?: string;

  /** 저화질 이미지(480) 상대 경로 */
  @Column({ nullable: true })
  lowQualityPath?: string;

  /** 고화질 이미지(1080) 상대 경로 */
  @Column({ nullable: true })
  highQualityPath?: string;

  /** 동영상 캡처화면 상대 경로 */
  @Column({ nullable: true })
  videoScreenshotPath?: string;

  /** 우선 순위 (정렬용) */
  @Column({ default: 0 })
  priority: number;
}
