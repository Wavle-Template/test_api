/**
 * NHN Toast 모듈입니다.
 * @module ToastModule
 */
import { HttpModule } from '@nestjs/axios';
import { Logger, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ToastSmsService } from './toast.sms.service';

@Module({
    imports: [ConfigModule, HttpModule],
    providers: [
        {
            provide: Logger,
            useValue: new Logger(ToastModule.name)
        },
        ToastSmsService
    ],
    exports: [ToastSmsService]
})
export class ToastModule {
    constructor(configService: ConfigService) {
        const toastApiKey = configService.get("TOAST_API_KEY");
        if (toastApiKey == null) throw new Error("TOAST_API_KEY가 없습니다.");
        const toastSmsNumber = configService.get("TOAST_SMS_SENDNO");
        if (toastSmsNumber == null) throw new Error("TOAST_SMS_SENDNO");
    }
}
