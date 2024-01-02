import { AuthService } from "@app/auth";
import { UserEntity, UserState } from "@app/entity";
import { SleeperEntity } from "@app/entity/user/sleeper/sleeper.entity";
import { Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { EntityManager } from "typeorm";

@Injectable()
export class SleeperService extends CRUDService<SleeperEntity> {
    #authService: AuthService;
    #entityManager: EntityManager;
    constructor(
        @InjectEntityManager() entityManager: EntityManager,
        authService: AuthService
    ) {
        super(entityManager, SleeperEntity);
        this.#authService = authService;
        this.#entityManager = entityManager;
    }

    async wakeUp(userId: string) {
        const sleeper = await this.#entityManager.findOne(SleeperEntity, {
            userId: userId
        }, { relations: ["user"] });
        if (!sleeper) {
            throw new Error("NOT_FOUND_SLEEPER");
        }
        return await this.#entityManager.transaction(async (manage) => {
            await manage.update(UserEntity, sleeper.userId, {
                email: sleeper.email,
                name: sleeper.name,
                nickname: sleeper.nickname,
                password: sleeper.password,
                phoneNumber: sleeper.phoneNumber,
                realname: sleeper.realname,
                salt: sleeper.salt,
                state: UserState.ACTIVE
            })
            await manage.delete(SleeperEntity, sleeper.id)
            return sleeper ?? null;
        })
    }

    /**
   * 아이디와 비밀번호로 휴면계정을 체크합니다. 없을 경우 null을 반환합니다.
   * @param username 아이디
   * @param password 비밀번호
   * @returns SleeperEntity {@link SleeperEntity}
   */
    async loginNamePassword(username: string, password: string): Promise<SleeperEntity | null> {
        const user = await this.entityManager.findOne(
            SleeperEntity,
            { name: username },
            { select: ["id", "salt", "name", "password"], relations: ["user"] },
        );
        if (user == null) return null;
        if (user.salt == null) return null;
        if (user.password == null) return null;
        if ((await this.#authService.comparePassword(password, Buffer.from(user.salt, "base64"), user.password)) === false)
            return null;
        return user
    }

    /**
   * 이메일과 비밀번호로 휴면계정을 체크합니다. 없을 경우 null을 반환합니다.
   * @param email 이메일
   * @param password 비밀번호
   * @returns SleeperEntity {@link SleeperEntity}
   */
    async loginEmailPassword(email: string, password: string): Promise<SleeperEntity | null> {
        const user = await this.#entityManager.findOne(
            UserEntity,
            { email: email },
            { select: ["id", "salt", "email", "password"] },
        );
        if (user == null) return null;
        if (user.salt == null) return null;
        if (user.password == null) return null;
        if ((await this.#authService.comparePassword(password, Buffer.from(user.salt, "base64"), user.password)) === false)
            return null;
        return user
    }
}