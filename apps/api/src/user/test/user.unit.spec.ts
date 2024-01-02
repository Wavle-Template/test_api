import { UserArchiveEntity } from "@app/entity/user/archive/user-archive.entity";
import { UserSuspenedLogEntity } from "@app/entity/user/log/suspended.entity";
import { SleeperEntity } from "@app/entity/user/sleeper/sleeper.entity";
import { ConfigModule } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { TypeOrmModule } from "@nestjs/typeorm";
import { getMockDbConnection } from "@test/utils/mock-db";
import { Connection } from "typeorm";
import { UserModule } from "../user.module";
import SettingConfig from '@app/setting'
import { UserResolver } from "../user.resolver";
import { UserService } from "../user.service";
import { UserRole, UserState } from "@app/entity";
import { DateTime } from "luxon";

describe('User Unit Test', () => {
    let module: TestingModule
    let connection;
    let userResolver: UserResolver;
    let userService: UserService;

    // mockEl.add({
    //     method: 'GET',
    //     path: '/_cat/health'
    // }, () => {
    //     return { status: 'ok' }
    // })

    beforeAll(async () => {

        connection = await getMockDbConnection([
            UserArchiveEntity, SleeperEntity, UserSuspenedLogEntity
        ])
        module = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({
                    load: [SettingConfig]
                }),
                TypeOrmModule.forRoot(),
                UserModule
            ],
        }).overrideProvider(Connection)
            .useValue(connection)
            .compile();
        userResolver = await module.resolve(UserResolver);
        userService = await module.resolve(UserService);
        await userService.createOne({
            name: "test",
            email: "test@naver.com",
            phoneNumber: "010-1234-1234"
        })
        await userService.createOne({
            name: "Test2",
            email: "Test2@naver.com",
            phoneNumber: "0102323223234"
        })
    });

    it("isExistsName test", async () => {

        expect(await userService.isExistsName(["test", "Test2"])).toBe(true)
        expect(await userService.isExistsName(["asd", "123123"])).toBe(false)
    })

    it("isExisisExistsEmailtsName test", async () => {

        expect(await userService.isExistsEmail(["test@naver.com", "Test2@naver.com"])).toBe(true)
        expect(await userService.isExistsEmail(["qwe123@naver.com", "23423123@naver.com"])).toBe(false)
    })

    it("isExistsPhoneNumber test", async () => {
        expect(await userService.isExistsPhoneNumber(["010-1234-1234", "0102323223234"])).toBe(true)
        expect(await userService.isExistsPhoneNumber(["010-4532-1234", "0107344222222"])).toBe(false)
    })

    it('createOne test', async () => {
        const inputData = {
            name: "createTest",
            email: "createTest@naver.com",
            phoneNumber: "010-1234-0234"
        }
        const newUser = await userService.createOne(inputData);
        expect(newUser).toHaveProperty("name", inputData.name);
        expect(newUser).toHaveProperty("email", inputData.email);
        expect(newUser).toHaveProperty("phoneNumber", inputData.phoneNumber);
    })

    it('createOne with pass test', async () => {
        const inputData = {
            name: "createTestPass",
            email: "createTestPass@naver.com",
            phoneNumber: "010-1244-0234",
            password: "1234"
        }
        const newUser = await userService.createOne(inputData);
        expect(newUser).toHaveProperty("name", inputData.name);
        expect(newUser).toHaveProperty("email", inputData.email);
        expect(newUser).toHaveProperty("phoneNumber", inputData.phoneNumber);
    })

    it("allIds test", async () => {
        const user1 = await userService.createOne({
            name: "test123",
            email: "test@naver.com",
            phoneNumber: "010-1234-1234",
            state: UserState.ACTIVE,
            role: UserRole.ADMIN
        })
        const user2 = await userService.createOne({
            name: "Test2234",
            email: "Test2@naver.com",
            phoneNumber: "0102323223234",
            state: UserState.ACTIVE,
            role: UserRole.ADMIN
        })

        const user3 = await userService.createOne({
            name: "Test3456",
            email: "Test3@naver.com",
            phoneNumber: "0102523223234",
            state: UserState.INACTIVE,
            role: UserRole.ADMIN
        })
        const activeUserIds = await userService.allIds(UserState.ACTIVE, UserRole.ADMIN);
        const inactiveUserIds = await userService.allIds(UserState.INACTIVE, UserRole.ADMIN);

        expect(activeUserIds).toEqual(expect.arrayContaining([user1.id, user2.id]))
        expect(inactiveUserIds).toEqual(expect.arrayContaining([user3.id]))

    })

    it("suspenedUsers test", async () => {
        const user1 = await userService.createOne({
            name: "supendUser1",
            email: "supendUser1@naver.com",
            phoneNumber: "010-1734-1234",
            state: UserState.SUSPENDED,
        })
        const user2 = await userService.createOne({
            name: "supendUser2",
            email: "supendUser2@naver.com",
            phoneNumber: "0102823223234",
            state: UserState.SUSPENDED,
        })
        const suspendUsers = await userService.suspenedUsers();
        expect(suspendUsers.map(item => item.id)).toEqual(expect.arrayContaining([user1.id, user2.id]))
    })

    it("lastLoginAtOneYear test", async () => {
        const twoYearDate = DateTime.now().minus({ "year": 2 }).toJSDate();
        const user1 = await userService.createOne({
            name: "lastLoginUser1",
            email: "lastLoginUser1@naver.com",
            phoneNumber: "010-7734-1234",
            lastLoginAt: twoYearDate
        })
        const user2 = await userService.createOne({
            name: "lastLoginUser2",
            email: "lastLoginUser2@naver.com",
            phoneNumber: "0108823223234",
            lastLoginAt: twoYearDate
        })
        const lastLoginAtUsers = await userService.lastLoginAtOneYear();
        expect(lastLoginAtUsers.map(item => item.id)).toEqual(expect.arrayContaining([user1.id, user2.id]))
    })


    afterAll(async () => {
        if (module) await module.close();
        if (connection) await connection.close();
    })
})