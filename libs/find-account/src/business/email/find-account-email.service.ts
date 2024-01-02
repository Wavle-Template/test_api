import { Inject, Injectable } from "@nestjs/common";
import { FIND_EMAIL_AUTH_REDIST } from "./find-account-email.const";
import Redis from "ioredis";
import * as crypto from "crypto";

@Injectable()
export class FindAccountEmailService {
    private TTL_TIME = 300;

    constructor(
        @Inject(FIND_EMAIL_AUTH_REDIST) public cacheManager: Redis,
    ) {

    }

    async requestAuthNumber(email: string): Promise<string> {
        const refinedEmail = email;
        const authNumber = crypto.randomInt(1, 999999).toString().padStart(6, "0");
        // await this.cacheManager.set(`FIND_EMAIL_REQUEST_TIME:${refinedPhoneNumber}`, new Date().toISOString(), "EX", this.TTL_TIME);
        await this.cacheManager.set(`FIND_EMAIL_AUTHENTICATION:${refinedEmail}:${authNumber}`, authNumber, "EX", this.TTL_TIME);
        return authNumber;
    }

    async validateAuthNumber(email: string, authNumber: string): Promise<boolean> {
        const refinedEmailNumber = email;
        const authNumberInStore = await this.cacheManager.get(
            `FIND_EMAIL_AUTHENTICATION:${refinedEmailNumber}:${authNumber}`
        );

        return authNumberInStore != null && authNumberInStore === authNumber;
    }

    async expireAuthNumber(email: string, authNumber: string): Promise<void> {
        const refinedEmailNumber = email;
        await this.cacheManager.del(`USER_PHONE_AUTHENTICATION:${refinedEmailNumber}:${authNumber}`);
    }
}