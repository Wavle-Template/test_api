import { ToastSmsService } from "@app/toast";
import { ConfigService } from "@nestjs/config";
import { Args, Mutation, Resolver } from "@nestjs/graphql";
import { BadRequestGraphQLError, PhoneNumber } from "@yumis-coconudge/common-module";
import { PhoneAuthService } from "./phone-auth.service";

@Resolver()
export class PhoneAuthResolver {

    constructor(
        public phoneAuthService: PhoneAuthService,
        public toastService: ToastSmsService,
        public configService: ConfigService
    ) {

    }

    @Mutation(returns => String, { description: "전화번호 인증 요청", nullable: true })
    async requestAuthNumber(
        @Args("phoneNumber", { type: () => PhoneNumber }) phoneNumber: string
    ): Promise<string | void> {
        const refinedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        try {
            await this.phoneAuthService.checkRequestTime(refinedPhoneNumber);
            const authNumber = await this.phoneAuthService.requestAuthNumber(refinedPhoneNumber);

            if (
                process.env.NHN_TOAST_APP_KEY != null &&
                process.env.NHN_TOAST_SECRET_KEY != null &&
                process.env.NHN_TOAST_SEND_NUMBER != null
            ) {
                const responseInfo = this.toastService.sendSms(`[${this.configService.get("PROJECT_NAME")}] 인증번호 [${authNumber}]를 입력해 주세요.`, refinedPhoneNumber)

                return;
            } else {
                return authNumber;
            }
        } catch (e) {
            if (e instanceof Error && e.message === "TOO MANY REQUEST") {
                throw new BadRequestGraphQLError("잠시 후 요청해주세요.");
            } else {
                throw e;
            }
        }
    }

    @Mutation(returns => String, { description: "전화번호 인증 확인" })
    async validateAuthNumber(
        @Args("phoneNumber", { type: () => PhoneNumber }) phoneNumber: string,
        @Args("authNumber") authNumber: string
    ): Promise<string> {
        const refinedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        const isOk = await this.phoneAuthService.validateAuthNumber(refinedPhoneNumber, authNumber);

        if (isOk === true) {
            await this.phoneAuthService.expireAuthNumber(refinedPhoneNumber, authNumber);
            return await this.phoneAuthService.generateRequestId(refinedPhoneNumber);
        }

        throw new BadRequestGraphQLError("잘못된 인증번호입니다.");
    }
}