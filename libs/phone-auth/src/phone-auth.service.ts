import { Inject, Injectable } from '@nestjs/common';
import Redis from 'ioredis';
import { PHONE_AUTH_REDIST } from './phone-auth.const';
import * as crypto from "crypto";
import { InjectRepository } from '@nestjs/typeorm';
import { UserEntity } from '@app/entity';
import { Repository } from 'typeorm';

@Injectable()
export class PhoneAuthService {

    private TTL_TIME = 300;

    constructor(
        @Inject(PHONE_AUTH_REDIST) public cacheManager: Redis,
        @InjectRepository(UserEntity) public repository: Repository<UserEntity>
    ) {

    }

    async checkRequestTime(phoneNumber: string): Promise<void> {
        const info = await this.cacheManager.get(`USER_PHONE_REQUEST_TIME:${phoneNumber}`);
        if (info === null) {
            throw new Error("NOT_FOUND")
        }
        const date = new Date(await this.cacheManager.get(`USER_PHONE_REQUEST_TIME:${phoneNumber}`));
        if (date.getTime() + 5000 > Date.now()) {
            throw new Error("TOO MANY REQUEST");
        }
    }

    async requestAuthNumber(phoneNumber: string): Promise<string> {
        const userCount = await this.repository.count({ phoneNumber: phoneNumber });
        if (userCount > 0) throw new Error("DUPLICATED");

        const refinedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        const authNumber = crypto.randomInt(1, 999999).toString().padStart(6, "0");
        await this.cacheManager.set(`USER_PHONE_REQUEST_TIME:${refinedPhoneNumber}`, new Date().toISOString(), "EX", this.TTL_TIME);
        await this.cacheManager.set(`USER_PHONE_AUTHENTICATION:${refinedPhoneNumber}:${authNumber}`, authNumber, "EX", this.TTL_TIME);
        return authNumber;
    }

    async validateAuthNumber(phoneNumber: string, authNumber: string): Promise<boolean> {
        const refinedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        const authNumberInStore = await this.cacheManager.get(
            `USER_PHONE_AUTHENTICATION:${refinedPhoneNumber}:${authNumber}`
        );

        return authNumberInStore != null && authNumberInStore === authNumber;
    }

    async expireAuthNumber(phoneNumber: string, authNumber: string): Promise<void> {
        const refinedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        await this.cacheManager.del(`USER_PHONE_AUTHENTICATION:${refinedPhoneNumber}:${authNumber}`);
    }

    async generateRequestId(phoneNumber: string): Promise<string> {
        const refinedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        const requestId = crypto.randomUUID();

        await this.cacheManager.set(`USER_PHONE_REQUEST_ID:${refinedPhoneNumber}`, requestId, "EX", this.TTL_TIME);
        return requestId;
    }

    async validateRequestId(phoneNumber: string, requestId: string): Promise<boolean> {
        const refinedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        const requestIdInStore = await this.cacheManager.get(`USER_PHONE_REQUEST_ID:${refinedPhoneNumber}`);

        return requestIdInStore != null && requestIdInStore === requestId;
    }

    async expireRequestId(phoneNumber: string): Promise<void> {
        const refinedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        await this.cacheManager.del(`USER_PHONE_REQUEST_ID:${refinedPhoneNumber}`);
    }

    async checkPhoneNumber(phoneNumber: string): Promise<boolean> {
        const refinedPhoneNumber = phoneNumber.replace(/[^0-9]/g, "");
        const userCount = await this.repository.count({ phoneNumber: refinedPhoneNumber });
        return userCount === 0;
    }
}
