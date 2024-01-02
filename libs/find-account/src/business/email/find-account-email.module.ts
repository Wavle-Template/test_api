import { FindAccountModule } from "@app/find-account/find-account.module";
import { WavleMailerModule } from "@app/mailer";
import { BaseUserModule } from "@app/user";
import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { JwtModule } from "@nestjs/jwt";
import { Email } from "@yumis-coconudge/common-module";
import Redis from 'ioredis';
import { FIND_EMAIL_AUTH_REDIST, FIND_EMAIL_AUTH_REDIST_DB_INDEX } from "./find-account-email.const";
import { FindPassByEmailResolver } from "./find-account-email.resolver";
import { FindAccountEmailService } from "./find-account-email.service";

@Module({
    imports: [
        ConfigModule,
        BaseUserModule,
        FindAccountModule, WavleMailerModule,
        JwtModule.registerAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const jwtSecret = Buffer.from(configService.get<string>("FIND_JWT_SECRET"), "base64");
                const jwtIssuer = configService.get("FIND_JWT_ISSUER");
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
        Email
    ],
    providers: [
        FindPassByEmailResolver,
        FindAccountEmailService,
        {
            provide: FIND_EMAIL_AUTH_REDIST,
            useFactory: (configService: ConfigService) => {
                const redisURL = configService.get<string>("REDIS_URL");
                const splitRedistURL = redisURL.split(":");
                return new Redis({
                    host: splitRedistURL[0],
                    port: Number(splitRedistURL[1]),
                    db: FIND_EMAIL_AUTH_REDIST_DB_INDEX
                })
            },
            inject: [ConfigService],
        }
    ]
})
export class FindPassByEmailModule { }