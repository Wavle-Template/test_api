import { UserEntityModule } from '@app/entity';
import { ToastModule } from '@app/toast';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import Redis from 'ioredis';
import { PHONE_AUTH_REDIST, PHONE_AUTH_REDIST_DB_INDEX } from './phone-auth.const';
import { PhoneAuthService } from './phone-auth.service';

@Module({
    imports: [
        UserEntityModule,
        ConfigModule,
        ToastModule
    ],
    providers: [
        PhoneAuthService,
        {
            provide: PHONE_AUTH_REDIST,
            useFactory: (configService: ConfigService) => {
                const redisURL = configService.get<string>("REDIS_URL");
                const splitRedistURL = redisURL.split(":");
                return new Redis({
                    host: splitRedistURL[0],
                    port: Number(splitRedistURL[1]),
                    db: PHONE_AUTH_REDIST_DB_INDEX
                })
            },
            inject: [ConfigService],
        }
    ],
    exports: [PhoneAuthService, PHONE_AUTH_REDIST],
})
export class PhoneAuthBasicModule { }
