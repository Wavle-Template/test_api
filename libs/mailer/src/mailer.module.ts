/**
 * Mailer 모듈입니다.
 * @module WavleMailerModule
 */
import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { WavleMailerService } from './mailer.service';

@Module({
    imports: [
        MailerModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                transport: {
                    host: configService.get("MAIL_HOST"),
                    port: configService.get("MAIL_PORT") ? Number(configService.get("MAIL_PORT")) : 587,
                    secure: configService.get("MAIL_SECURE") === "true",
                    auth: {
                        user: configService.get("MAIL_USER"),
                        pass: configService.get("MAIL_PASS")
                    }
                },
                defaults: {
                    from: configService.get("MAIL_FROM")
                }
            })
        })
    ],
    providers: [WavleMailerService],
    exports: [WavleMailerService]
})
export class WavleMailerModule { }
