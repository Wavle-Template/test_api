import { UserState } from "@app/entity";
import { SleeperEntity } from "@app/entity/user/sleeper/sleeper.entity";
import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { DateTime } from "luxon";
import { UserArchiveService } from "./archive/user-archive.service";
import { SleeperService } from "./sleeper/sleeper.service";
import { UserService } from "./user.service";


@Injectable()
export class UserScheduleService {

    #userService: UserService;
    #sleeperService: SleeperService;
    #userArchiveService: UserArchiveService;
    #logger = new Logger(UserScheduleService.name);

    constructor(
        userService: UserService,
        sleeperService: SleeperService,
        userArchiveService: UserArchiveService
    ) {
        this.#userService = userService;
        this.#sleeperService = sleeperService;
        this.#userArchiveService = userArchiveService;
    }

    /** 정지해제 */
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async releaseSuspension() {
        const nowDate = DateTime.now();
        this.#logger.log("====정지해제 스케쥴러 시작====");
        this.#logger.log(`====동작 일시 : ${nowDate.toLocaleString()} ====`);
        await this.#userService.useTransaction(async manager => {
            const suspensionUsers = await this.#userService.suspenedUsers(nowDate.toJSDate());
            this.#logger.log(`====검색된 유저 수 : ${suspensionUsers.length}명 ====`);
            if (suspensionUsers.length > 0) {
                await this.#userService.updateMany(suspensionUsers.map(item => item.id), {
                    state: UserState.ACTIVE,
                    suspendedAt: null,
                    suspendedEndAt: null,
                    suspendedReason: null
                }, manager)
            }

            return true
        })

        this.#logger.log("====정지해제 스케쥴러 종료====");
    }

    /** 휴면 처리 */
    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async doDormant() {
        const nowDate = DateTime.now();
        this.#logger.log("====휴면처리 스케쥴러 시작====");
        this.#logger.log(`====동작 일시 : ${nowDate.toLocaleString()} ====`);
        const sleeperUsers = await this.#userService.lastLoginAtOneYear();
        this.#logger.log(`====검색된 유저 수 : ${sleeperUsers.length}명 ====`);
        await this.#userService.useTransaction(async manager => {
            if (sleeperUsers.length > 0) {
                const sleepers = await this.#sleeperService.createMany(sleeperUsers.map(item => ({
                    email: item.email,
                    name: item.name,
                    nickname: item.nickname,
                    password: item.password,
                    phoneNumber: item.phoneNumber,
                    realname: item.realname,
                    salt: item.salt,
                    user: item
                })), manager)
                await this.#userService.updateMany(sleeperUsers.map(item => item.id), {
                    state: UserState.INACTIVE,
                    dormantAt: nowDate.toJSDate(),
                    name: "휴면계정",
                    nickname: "휴면계정",
                    realname: "휴면계정",
                    phoneNumber: "000-0000-0000",
                    email: "dormant@email.com",
                    salt: null
                }, manager);
            }
        })
        this.#logger.log("====휴면처리 스케쥴러 종료====");
    }

    /** 탈퇴정보 180일 지난것 삭제 */
    @Cron(CronExpression.EVERY_DAY_AT_1AM)
    async deleteArchiveData() {
        const nowDate = DateTime.now();
        this.#logger.log("====탈퇴정보 삭제 스케쥴러 시작====");
        this.#logger.log(`====동작 일시 : ${nowDate.toLocaleString()} ====`);
        await this.#userArchiveService.deleteArchiveData(nowDate.minus({ day: 180 }).toJSDate())
        this.#logger.log("====탈퇴정보 삭제 스케쥴러 종료====");
    }

}