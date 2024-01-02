import { UserEntityModule } from '@app/entity';
import { ToastModule } from '@app/toast';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PhoneNumber } from '@yumis-coconudge/common-module';
import Redis from 'ioredis';
import { PhoneAuthBasicModule } from './phone-auth-basic.module';
import { PHONE_AUTH_REDIST, PHONE_AUTH_REDIST_DB_INDEX } from './phone-auth.const';
import { PhoneAuthResolver } from './phone-auth.resolver';
import { PhoneAuthService } from './phone-auth.service';

@Module({
  imports: [
    UserEntityModule,
    ConfigModule,
    ToastModule,
    PhoneAuthBasicModule,
    PhoneNumber
  ],
  providers: [
    PhoneAuthResolver,
  ],
})
export class PhoneAuthModule { }
