/**
 * @module UserSocialNaverLoginModule
 */
import { AuthTokenResponse } from '@app/auth/token/response.model';
import { AuthTokenService } from '@app/auth/token/token.service';
import { UserState } from '@app/entity';
import { User } from '@app/user/user.model';
import { ConfigService } from '@nestjs/config';
import { Args, ID, Mutation, Resolver } from '@nestjs/graphql';
import { NotFoundGraphQLError } from '@yumis-coconudge/common-module';
import { AuthenticationError } from 'apollo-server-fastify';
import dedent from 'dedent';
import { SignUpInput } from '../../user.input';
import { SignUpResult } from '../../user.model';
import { UserSocialType } from "@app/entity/user/social/social.enum";
import { SocialSignUpInput } from '../social.model';
import { UserSocialService } from '../social.service';
import { UserSocialNaverLoginService } from './naver-login.service';
/**
 * 사용자 소셜 네이버 로그인 리졸버
 * @description GraphQL 문서를 참고하세요.
 * @category Provider
 */
@Resolver()
export class UserSocialNaverLoginResolver {
    constructor(
        public configService: ConfigService,
        public naverLoginService: UserSocialNaverLoginService,
        public userSocialService: UserSocialService,
        public authTokenService: AuthTokenService,
    ) { }

    @Mutation(returns => AuthTokenResponse, {
        description: dedent`
      네이버 소셜 계정을 이용하여 로그인합니다.

      **에러 코드**
      - \`UNAUTHENTICATED\`: 잘못된 네이버 계정입니다.
      - \`NOT_FOUND\`: 가입하지 않은 계정입니다.
    `,
    })
    async signInNaver(
        @Args("accessToken", { description: "네이버 접근 토큰" }) accessToken: string,
    ): Promise<AuthTokenResponse> {
        const socialId = await this.naverLoginService.validate(accessToken).catch(() => {
            throw new AuthenticationError("잘못된 네이버 계정입니다.");
        });
        const user = (await this.userSocialService.findOne(UserSocialType.NAVER, socialId));

        if (user.userId == null) throw new AuthenticationError("가입하지 않은 계정입니다.");
        if (user.user.state === UserState.INACTIVE) throw new AuthenticationError("휴면 계정입니다.", { userId: user.id });

        const userId = user.userId;

        const authToken = await this.authTokenService.generate(userId);
        await this.userSocialService.updateLastLoginAt(userId);
        return {
            tokenType: authToken.token_type,
            accessToken: authToken.access_token,
            expiresIn: authToken.expires_in,
            refreshToken: authToken.refresh_token,
        };
    }

    @Mutation(returns => SignUpResult, {
        description: dedent`
      네이버 소셜 계정을 이용하여 회원가입합니다.

      **에러 코드**
      - \`UNAUTHENTICATED\`: 잘못된 네이버 계정입니다.
    `,
    })
    async signUpNaver(
        @Args("accessToken", { description: "네이버 접근 토큰" }) accessToken: string,
        @Args("data", { description: "회원가입 데이터" }) data: SocialSignUpInput,
    ) {
        const socialId = await this.naverLoginService.validate(accessToken).catch(() => {
            throw new AuthenticationError("잘못된 네이버 계정입니다.");
        });

        const tempData = {
            ...data,
            role: "MEMBER",
            name: data.name != null ? data.name.replace(/\s|\t|\r|\n/g, "") : null,
            // password: data.password != null ? data.password.replace(/\s|\t|\r|\n/g, "") : null,
        };

        const user = await this.userSocialService.createUser(UserSocialType.NAVER, socialId, tempData);
        const authToken = await this.authTokenService.generate(user.id);

        return {
            user: user,
            token: {
                accessToken: authToken.access_token,
                expiresIn: authToken.expires_in,
                refreshToken: authToken.refresh_token,
                tokenType: authToken.token_type,
            },
        };
    }

    @Mutation(returns => User, {
        description: dedent`
      이미 가입된 계정에 네이버 소셜 계정을 연결합니다.

      **에러 코드**
      - \`UNAUTHENTICATED\`: 잘못된 네이버 계정입니다.
    `,
    })
    async linkKakao(
        @Args("accessToken", { description: "네이버 접근 토큰" }) accessToken: string,
        @Args("userId", { type: () => ID, description: "사용자 ID" }) userId: string,
        @Args("email", { description: "이메일", nullable: true }) email?: string,
    ) {
        const socialId = await this.naverLoginService.validate(accessToken).catch(() => {
            throw new AuthenticationError("잘못된 네이버 계정입니다.");
        });

        return await this.userSocialService.linkUser(UserSocialType.KAKAO, socialId, userId, email);
    }
}
