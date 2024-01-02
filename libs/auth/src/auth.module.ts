/**
 * 인증 및 권한과 관련된 모듈입니다.
 *
 * ## 다이어그램
 *
 * ```mermaid
 * classDiagram
 * JwtModule --> AuthModule : Import
 * ConfigModule --> AuthModule : Import
 * AuthModule o-- AuthService : Provide
 * AuthModule o-- AuthTokenService : Provide
 * AuthModule o-- AuthResolver : Provide
 * AuthModule o-- AuthController : Provide
 * AuthTokenService <.. EntityManager : Inject
 * AuthTokenService <.. JwtService : Inject
 * AuthTokenService <.. ConfigService : Inject
 * AuthController <.. JwtService : Inject
 * AuthController <.. AuthService : Inject
 * AuthController <.. AuthTokenService : Inject
 * AuthResolver <.. JwtService : Inject
 * AuthResolver <.. AuthService : Inject
 * AuthResolver <.. AuthTokenService : Inject
 * ```
 * @module AuthModule
 */
import { UserEntity } from "@app/entity";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AuthController } from "./auth.controller";
import { AuthResolver } from "./auth.resolver";
import { AuthService } from "./auth.service";
import { LastLoginService } from "./last.login.service";
import { AuthTokenService } from "./token/token.service";

/**
 * 인증 모듈
 * @hidden
 */
@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const jwtSecret = Buffer.from(configService.get<string>("JWT_SECRET"), "base64");
        const jwtIssuer = configService.get("JWT_ISSUER");
        return {
          secret: jwtSecret,
          signOptions: {
            algorithm: "HS512",
            issuer: jwtIssuer,
          },
          verifyOptions: {
            algorithms: ["HS512"],
            issuer: jwtIssuer,
          },
        };
      },
    }),
    ConfigModule,
  ],
  providers: [AuthService, AuthTokenService, AuthResolver, LastLoginService],
  controllers: [AuthController],
  exports: [JwtModule, AuthService, AuthTokenService],
})
export class AuthModule { }
