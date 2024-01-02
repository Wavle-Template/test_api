import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UserSocialModule } from '../social.module';
import { UserSocialNaverLoginService } from './naver-login.service';
import { UserSocialNaverLoginResolver } from './naver-login.resolver';
import { AuthModule } from '@app/auth';

@Module({
    imports: [ConfigModule, HttpModule, AuthModule, UserSocialModule],
    providers: [UserSocialNaverLoginService, UserSocialNaverLoginResolver]
})
export class UserSocialNaverLoginModule {
    constructor(configService: ConfigService) {
        const clientId = configService.get("NAVER_API_CLIENT_ID");
        if (clientId == null) throw new Error("NAVER_API_CLIENT_ID가 없습니다.");
    }
}
