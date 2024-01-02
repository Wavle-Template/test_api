/**
 * @module AuthModule
 */
import crypto from "crypto";
import util from "util";
import { Injectable } from "@nestjs/common";

const scrypt: (password: crypto.BinaryLike, salt: crypto.BinaryLike, keylen: number) => Promise<Buffer> =
  util.promisify(crypto.scrypt);

const SALT_LENGTH = 256;
const KEY_LENGTH = 256;

/**
 * 인증과 관련된 서비스입니다.
 * @category Provider
 */
@Injectable()
export class AuthService {
  /**
   * 일정 길이의 솔트 값을 생성합니다.
   * @returns 솔트 값
   */
  generateSalt(): Buffer {
    return crypto.randomBytes(SALT_LENGTH);
  }

  /**
   * 비밀번호를 암호화합니다.
   * @param password 평문 비밀번호
   * @param salt 솔트
   * @returns 암호화된 비밀번호
   */
  async encryptPassword(password: string, salt: Buffer): Promise<string> {
    return (await scrypt(password, salt, KEY_LENGTH)).toString("base64");
  }

  /**
   * 비밀번호가 같은지 비교합니다. 타이밍 공격 방지가 되어있습니다.
   * @param inputPassword 입력한 평문 비밀번호
   * @param salt 솔트
   * @param storedPassword 저장한 암호화된 비밀번호
   * @returns 같은 비밀번호 여부
   */
  async comparePassword(inputPassword: string, salt: Buffer, storedPassword: string | Buffer): Promise<boolean> {
    const passwordA = await scrypt(inputPassword, salt, KEY_LENGTH);
    let passwordB: Buffer;
    if (storedPassword instanceof Buffer) passwordB = storedPassword;
    else passwordB = Buffer.from(storedPassword, "base64");

    return crypto.timingSafeEqual(passwordA, passwordB);
  }
}
