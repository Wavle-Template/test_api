/**
 * @module AuthModule
 */
import { Column, Entity, PrimaryColumn } from "typeorm";

/**
 * 인증 토큰 블랙리스트
 * @description 토큰이 올바른지 검사하기 위한 용도가 아닌, 토큰을 차단하기 위한 용도로 사용합니다.
 * @category TypeORM Entity
 */
@Entity({ name: "auth_token_blacklist" })
export class AuthTokenBlacklistEntity {
  /**
   * JWT ID
   */
  @PrimaryColumn("uuid")
  id: string;

  /**
   * 토큰 만료 날짜/시간
   *
   * 이미 만료된 토큰을 블랙리스트에서 일괄 삭제하기 위하여 사용합니다.
   */
  @Column("timestamptz", { nullable: true })
  expiresAt: Date;
}
