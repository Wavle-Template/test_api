import { UserSocialType } from "@app/entity/user/social/social.enum";
import { FinedAccount } from "@app/find-account/find-account.model";
import { WavleMailerService } from "@app/mailer";
import { BaseUserService } from "@app/user";
import { ConfigService } from "@nestjs/config";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { JwtService, JwtSignOptions } from "@nestjs/jwt";
import { BadRequestGraphQLError, Email, InternalServerGraphQLError, NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import dedent from "dedent";
import path from "path";
import { IFindEmailToken } from "./find-account-email.interface";
import { FindAccountEmailService } from "./find-account-email.service";

@Resolver()
export class FindPassByEmailResolver {

    #wavleMailerService: WavleMailerService;
    #baseUserService: BaseUserService;
    FIND_LINK: string;
    TOKEN_EXPIRES_IN: number;
    PROJECT_NAME: string;
    #jwtService: JwtService;
    #findAccountEmailService: FindAccountEmailService;
    #configeService: ConfigService

    constructor(
        wavleMailerService: WavleMailerService,
        baseUserService: BaseUserService,
        configeService: ConfigService,
        jwtService: JwtService,
        findAccountEmailService: FindAccountEmailService,
    ) {
        this.#wavleMailerService = wavleMailerService;
        this.#baseUserService = baseUserService;
        this.FIND_LINK = configeService.get("FIND_PASS_LINK");
        this.#jwtService = jwtService;
        this.TOKEN_EXPIRES_IN = configeService.get("FIND_JWT_REFRESH_TOKEN_EXPIRES_IN") * 1000
        this.PROJECT_NAME = configeService.get("PROJECT_NAME");
        this.#findAccountEmailService = findAccountEmailService
        this.#configeService = configeService;
        if (this.FIND_LINK === null || this.FIND_LINK === undefined || this.FIND_LINK === "") throw new Error("비밀번호 찾기 링크가 셋팅되어있지 않습니다.");
    }

    @Mutation(returns => Boolean, {
        description: dedent`
        이메일 비밀번호 찾기 Token 유효성 검사
        `
    })
    async verifactionFindPassEmailToken(
        @Args("token", { type: () => String, description: "토큰 값" }) token: string
    ): Promise<boolean> {
        try {
            const decodeToken = this.#jwtService.decode(token);
            return true;
        } catch (error) {
            console.error(error);
            return false;
        }
    }

    @Mutation(returns => Boolean, {
        description: dedent`
        이메일을 통한 비밀번호 변경 처리

        **에러 코드**
        - \`NOT_FOUND\`: 해당 사용자를 찾을 수 없습니다.
        - \`BAD_REQUEST\`: 하나 이상의 소셜로 회원가입한 계정입니다.
        - \`BAD_REQUEST\`: 비밀번호 변경이 불가한 계정입니다.
        - \`BAD_REQUEST\`: 잘못된 토큰
        `
    })
    async changePasswordFromEmailToken(
        @Args("token", { type: () => String, description: "토큰 값" }) token: string,
        @Args("newPassword", { type: () => String, description: "새로운 비밀번호" }) newPassword: string,
    ): Promise<boolean> {
        try {
            const decodeToken: IFindEmailToken = this.#jwtService.decode(token) as IFindEmailToken;
            const user = await this.#baseUserService.findOne(decodeToken.id, ["socials"]);
            if (!user) throw new NotFoundGraphQLError();
            else if (user.socials.length > 0) throw new BadRequestGraphQLError("하나 이상의 소셜로 회원가입한 계정입니다.");
            else if (user.salt === null || user.password === null) throw new BadRequestGraphQLError("비밀번호 변경이 불가한 계정입니다.");

            await this.#baseUserService.updateOne(user.id, {
                password: newPassword.replace(/\s|\t|\r|\n/g, "")
            })

            return true;
        } catch (error) {
            throw new BadRequestGraphQLError("잘못된 토큰");
        }
    }

    @Mutation(returns => Boolean, {
        description: dedent`
    이메일로 비밀번호 변경 링크를 전송합니다.

    **에러 코드**
    - \`NOT_FOUND\`: 해당 사용자를 찾을 수 없습니다.
    `
    })
    async sendFindPassEmail(
        @Args("email", { type: () => Email }) email: string
    ) {
        const user = await this.#baseUserService.findOneByEmail(email);
        if (!user) throw new NotFoundGraphQLError("해당 사용자를 찾을 수 없습니다.");
        else if (user.socials.length > 0) throw new BadRequestGraphQLError("하나 이상의 소셜로 회원가입한 계정입니다.");
        else if (user.salt === null || user.password === null) throw new BadRequestGraphQLError("비밀번호 변경이 불가한 계정입니다.");
        const payload: IFindEmailToken = {
            email: email,
            id: user.id,
        };
        const options: JwtSignOptions = {
            subject: user.id,
            jwtid: crypto.randomUUID(),
            expiresIn: this.TOKEN_EXPIRES_IN,
        };

        const token = this.#jwtService.sign(payload, options);

        const emailForm = `
        <!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${this.PROJECT_NAME} - 비밀번호 찾기 안내</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<style type="text/css">
    /* GENERAL STYLE RESETS */
    body,
    #bodyTable {
        width: 100% !important;
        height: 100% !important;
        margin: 0;
        padding: 0;
    }

    #bodyTable {
        padding: 20px 0 30px 0;
        background-color: #ffffff;
    }

    img,
    a img {
        border: 0;
        outline: none;
        text-decoration: none;
    }

    .imageFix {
        display: block;
    }

    table,
    td {
        border-collapse: collapse;
    }
</style>

<body>
    <!-- OUTERMOST CONTAINER TABLE -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" id="bodyTable">
        <tr>
            <td>

                <!-- 600px - 800px CONTENTS CONTAINER TABLE -->
                <table border="0" cellpadding="0" cellspacing="0" width="600">
                    <tr>
                        <td>
                            비밀번호 변경을 위해 이메일이 발송됬습니다.
                            요청하지않은 이메일일 경우 관리자에게 문의바랍니다.


                        </td>
                    </tr>
                    <tr>
                        <td bgcolor="#2bcae3" align="center" width="200"
                            style="border-radius: 20px; -webkit-text-size-adjust: none;">
                            <a href="${path.join(this.FIND_LINK, `?token=${token}`)}"
                                style="color: #147e94; font-family: sans-serif; font-size: 13px; font-weight: bold; line-height: 40px; text-decoration: none;">
                                <font color="#147e94">비밀번호 변경하기</font>
                            </a>
                        </td>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>

</html>
        `
        await this.#wavleMailerService.sendHtml(user.email, `[${this.PROJECT_NAME}]비밀번호변경 안내`, emailForm)
    }


    @Mutation(returns => Boolean, {
        description: dedent`
        본인확인 이메일 인증 - 이메일 인증번호 전송
        해당 이메일과 일치하는 정보가 없어도 true로 반환합니다.
        `
    })
    async requestFindEmailAuthNumber(
        @Args("email", { type: () => Email }) email: string
    ) {
        const userInfo = await this.#baseUserService.findOneByEmail(email);
        if (!userInfo) return true;

        const authNumber = await this.#findAccountEmailService.requestAuthNumber(userInfo.email);

        const emailForm = `
        <!DOCTYPE html
    PUBLIC "-//W3C//DTD XHTML 1.0 Transitional//EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
<html xmlns="http://www.w3.org/1999/xhtml">

<head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <title>${this.PROJECT_NAME} - 아이디 찾기 안내</title>
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<style type="text/css">
    /* GENERAL STYLE RESETS */
    body,
    #bodyTable {
        width: 100% !important;
        height: 100% !important;
        margin: 0;
        padding: 0;
    }

    #bodyTable {
        padding: 20px 0 30px 0;
        background-color: #ffffff;
    }

    img,
    a img {
        border: 0;
        outline: none;
        text-decoration: none;
    }

    .imageFix {
        display: block;
    }

    table,
    td {
        border-collapse: collapse;
    }
</style>

<body>
    <!-- OUTERMOST CONTAINER TABLE -->
    <table border="0" cellpadding="0" cellspacing="0" width="100%" id="bodyTable">
        <tr>
            <td>

                <!-- 600px - 800px CONTENTS CONTAINER TABLE -->
                <table border="0" cellpadding="0" cellspacing="0" width="600">
                    <tr>
                        <td>
                            아이디 찾기를 위해 이메일이 발송됬습니다.
                            요청하지않은 이메일일 경우 관리자에게 문의바랍니다.


                        </td>
                    </tr>
                    <tr>
                        <td>
                            <p>인증번호 : ${authNumber}</p>
                        </td>
                    </tr>
                    </tr>
                </table>

            </td>
        </tr>
    </table>
</body>

</html>
        `
        await this.#wavleMailerService.sendHtml(userInfo.email, `[${this.PROJECT_NAME}]아이디 찾기 안내`, emailForm)
    }

    @Mutation(returns => FinedAccount, {
        description: dedent`
    본인확인 이메일 인증 - 이메일 인증번호 검증
    검증이 유효할시 loginId 반환
    `
    })
    async validateFindEmailAuthNumber(
        @Args("email", { type: () => Email }) email: string,
        @Args("authNumber") authNumber: string
    ): Promise<FinedAccount> {
        const isOk = await this.#findAccountEmailService.validateAuthNumber(email, authNumber);

        if (isOk === true) {
            const userInfo = await this.#baseUserService.findOneByEmail(email);
            if (!userInfo) {
                throw new NotFoundGraphQLError();
            }
            await this.#findAccountEmailService.expireAuthNumber(email, authNumber);
            const loginField = this.#configeService.get<"email" | "name">("login_field") ?? "email";
            if (userInfo[loginField] === undefined) throw new InternalServerGraphQLError();

            return {
                loginId: userInfo[loginField],
                socialTypes: userInfo.socials.length > 0 ? userInfo.socials.map(item => item.socialType as UserSocialType) : undefined
            }
        }

        throw new BadRequestGraphQLError("잘못된 인증번호입니다.");


    }
}