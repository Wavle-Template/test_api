import { HttpService } from '@nestjs/axios';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { IUserSocialLoginService } from '../social-login.interface';
import { NAVER_OPEN_API_URL } from './naver-login.const';
import { INaverMe } from './naver-login.interface';

/**
 * 네이버 계정으로 로그인하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class UserSocialNaverLoginService implements IUserSocialLoginService {

    /** Http 서비스 */
    #httpService: HttpService;
    /** 컨픽 서비스 */
    #configService: ConfigService;

    /**
     * @param httpService Http 서비스
     * @param configService 컨픽 서비스
     */
    constructor(httpService: HttpService, configService: ConfigService) {
        this.#httpService = httpService;
        this.#configService = configService;
    }

    /**
     * 해당 접근 토큰(Access Token)이 유효한지 확인하고 소셜 ID를 얻습니다.
     * @param token 접근 토큰(Access Token)
     * @returns 소셜 ID
     */
    async validate(token: string): Promise<string> {
        try {
            const url = new URL("/v1/nid/me", NAVER_OPEN_API_URL).href;
            const infoResponse = await new Promise<INaverMe>((resolve, reject) => {
                this.#httpService
                    .get(url, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                        },
                    })
                    .subscribe({
                        error: err => reject(err),
                        next: response => resolve(response.data),
                    });
            });
            if(infoResponse.resultcode !=="00"){
                throw new UnauthorizedException();
            }
            return infoResponse.response.id;
        } catch (e) {
            console.error(e);
            
            throw new UnauthorizedException();
        }
    }

    

}
