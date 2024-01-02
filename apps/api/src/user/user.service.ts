/**
 * @module UserModule
 */
import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectEntityManager } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { EntityManager, FindCondition, In, LessThan } from "typeorm";
import { USER_ELASTICSEARCH_INDEX_NAME } from "./user.const";
import { UserDocument } from "./user.type";
import { DeepPartial } from "ts-essentials";
import { UserRole, UserState } from "@app/entity";
import { UserEntity } from '@app/entity'
import { AuthService } from "@app/auth";
import { DateTime } from "luxon";
import { SearchService } from "@app/search";

/**
 * 사용자를 관리하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class UserService extends CRUDService<UserEntity> {
  #authService: AuthService;
  #searchService: SearchService;

  constructor(
    @InjectEntityManager() entityManager: EntityManager,
    authService: AuthService,
    searchService: SearchService,
  ) {
    super(entityManager, UserEntity);
    this.#authService = authService;
    this.#searchService = searchService;
  }

  //#region 중복 체크용 함수
  /**
   * 사용자 중에 중복된 이름이 있는지 체크합니다.
   * @param names 중복 체크할 이름 목록
   * @param transactionManager 이미 트랜잭션을 사용 중일 경우, 지정할 엔티티 매니저
   * @returns {Promise<boolean>} 중복 여부
   */
  async isExistsName(names: string[], transactionManager?: EntityManager): Promise<boolean> {
    return this.useTransaction(async (manager: EntityManager) => {
      return (await manager.count(UserEntity, { name: In(names) })) > 0;
    }, transactionManager);
  }

  /**
   * 사용자 중에 중복된 이메일이 있는지 체크합니다.
   * @param emails 중복 체크할 이메일 목록
   * @param transactionManager 이미 트랜잭션을 사용 중일 경우, 지정할 엔티티 매니저
   * @returns {Promise<boolean>} 중복 여부
   */
  async isExistsEmail(emails: string[], transactionManager?: EntityManager): Promise<boolean> {
    return this.useTransaction(async (manager: EntityManager) => {
      return (await manager.count(UserEntity, { email: In(emails) })) > 0;
    }, transactionManager);
  }

  /**
   * 사용자 중에 중복된 전화번호가 있는지 체크합니다.
   * @param phoneNumbers 중복 체크할 전화번호 목록
   * @param transactionManager 이미 트랜잭션을 사용 중일 경우, 지정할 엔티티 매니저
   * @returns {Promise<boolean>} 중복 여부
   */
  async isExistsPhoneNumber(phoneNumbers: string[], transactionManager?: EntityManager): Promise<boolean> {
    return this.useTransaction(async (manager: EntityManager) => {
      return (await manager.count(UserEntity, { phoneNumber: In(phoneNumbers) })) > 0;
    }, transactionManager);
  }
  //#endregion

  //#region 오버라이드한 함수
  /**
   * 사용자를 생성합니다.
   * @param data 생성할 사용자의 데이터
   * @returns 사용자 엔티티
   */
  async createOne(data: DeepPartial<UserEntity>, transactionManager?: EntityManager): Promise<UserEntity> {
    const salt = this.#authService.generateSalt();
    const password = data.password != null ? await this.#authService.encryptPassword(data.password, salt) : null;
    const tempData = {
      ...data,
      salt: salt.toString("base64"),
      password: password,
    };

    const user = await this.useTransaction(async manager => {
      const existsName = await this.isExistsName([tempData.name], manager);
      if (existsName === true) throw new BadRequestException("이미 사용 중인 이름입니다.");

      return await super.createOne(tempData, manager);
    }, transactionManager);

    await this.#searchService.set(USER_ELASTICSEARCH_INDEX_NAME, {
      id: user.id,
      idx: user.idx,
      name: user.name,
      nickname: user.nickname,
    });

    return user;
  }

  /**
   * 사용자를 여러명 생성합니다.
   * @param datas 생성할 사용자들의 데이터 목록
   * @returns 사용자 엔티티 목록
   */
  async createMany(datas: DeepPartial<UserEntity>[]): Promise<UserEntity[]> {
    const tempDatas = await Promise.all(
      datas.map(async data => {
        const salt = this.#authService.generateSalt();
        const password = data.password != null ? await this.#authService.encryptPassword(data.password, salt) : null;

        return {
          ...data,
          salt: salt.toString("base64"),
          password: password,
        };
      }),
    );

    const users = await this.entityManager.transaction(async manager => {
      const existsName = await this.isExistsName(tempDatas.map(tempData => tempData.name));
      if (existsName === true) throw new BadRequestException("이미 사용 중인 이름이 포함되어있습니다.");

      return await super.createMany(tempDatas, manager);
    });

    await this.#searchService.bulk<UserDocument>(
      USER_ELASTICSEARCH_INDEX_NAME,
      users.map(user => ({
        bulkType: "create",
        id: user.id,
        idx: user.idx,
        name: user.name,
        nickname: user.nickname,
      })),
    );

    return users;
  }

  /**
   * 특정 사용자를 수정합니다.
   * @param id 사용자 ID
   * @param data 수정할 데이터
   * @param transactionManager 트랜잭션
   * @returns 수정한 사용자 엔티티
   */
  async updateOne(
    id: string | number,
    data: DeepPartial<UserEntity>,
    transactionManager?: EntityManager,
  ): Promise<UserEntity> {
    const user = await this.useTransaction(async manager => {
      const user = await manager.findOne(UserEntity, id, { select: ["salt"] });

      let tempData = { ...data };
      if (data.password !== undefined) {
        const salt = Buffer.from(user.salt, "base64");
        tempData = { ...data, password: await this.#authService.encryptPassword(data.password, salt) };
      }

      if (data.name === null) throw new BadRequestException("이름을 삭제할 수 없습니다.");
      if (data.name !== undefined) {
        const existsName = await this.isExistsName([tempData.name], manager);
        if (existsName === true) throw new BadRequestException("이미 사용 중인 이름입니다.");
      }

      return await super.updateOne(id, tempData, manager);
    }, transactionManager);

    let document: Partial<UserDocument> = {};
    if (data.id !== undefined) document = { ...document, id: user.id };
    if (data.idx !== undefined) document = { ...document, idx: user.idx };
    if (data.name !== undefined) document = { ...document, name: user.name };
    if (data.nickname !== undefined) document = { ...document, nickname: user.nickname };

    await this.#searchService.set<UserDocument>(USER_ELASTICSEARCH_INDEX_NAME, document as Required<UserDocument>);

    return user;
  }
  //#endregion

  /**
   * 사용자를 빠르게 검색합니다.
   * @param keyword 검색할 키워드
   * @param userId 검색한 사용자의 아이디
   * @param size 검색할 사용자의 수
   * @returns 검색 결과
   */
  async search(keyword: string, userId?: string, size = 5): Promise<UserDocument[]> {
    let blockUserIds: string[] = [];
    if (userId != null) {
      blockUserIds = (
        await this.entityManager.findOne(UserEntity, userId, {
          relations: ["blocks"],
          select: ["id", "blocks"],
        })
      ).blocks.map(block => block.destinationId);
    }

    let documents: UserDocument[];
    if (keyword[0] === "#" && Number.isNaN(parseInt(keyword.slice(1))) === false) {
      documents = await this.#searchService.search(
        USER_ELASTICSEARCH_INDEX_NAME,
        {
          query: {
            bool: {
              must: [{ term: { idx: keyword.slice(1) } }],
              must_not: blockUserIds.map(userId => ({ match: { id: userId } })),
            },
          },
        },
        size,
      );
    } else if (
      keyword.includes("#") === true &&
      keyword.length >= 3 &&
      Number.isNaN(parseInt(keyword.slice(1))) === false
    ) {
      const splitKeyword = keyword.split("#");
      documents = await this.#searchService.search(
        USER_ELASTICSEARCH_INDEX_NAME,
        {
          query: {
            bool: {
              must: [{ term: { idx: splitKeyword[1] } }],
              should: {
                wildcard: {
                  nickname: {
                    value: `*${splitKeyword[0]}*`,
                  },
                },
              },
              must_not: blockUserIds.map(userId => ({ match: { id: userId } })),
            },
          },
        },
        size,
      );
    } else {
      documents = await this.#searchService.search(
        USER_ELASTICSEARCH_INDEX_NAME,
        {
          query: {
            bool: {
              must: {
                wildcard: {
                  nickname: {
                    value: `*${keyword}*`,
                  },
                },
              },
              must_not: blockUserIds.map(userId => ({ match: { id: userId } })),
            },
          },
        },
        size,
      );
    }

    return documents;
  }

  /**
   * 모든 유저의 id를 반환
   */
  async allIds(state?: UserState, role?: UserRole) {
    const inputWhere: FindCondition<UserEntity> = {};
    if (state) {
      inputWhere["state"] = state
    }
    if (role) {
      inputWhere["role"] = role;
    }
    const rows = await this.repository.find({
      select: ["id"],
      where: inputWhere
    })
    return rows.map(item => item.id)
  }

  /** 정지상태인 유저들 */
  async suspenedUsers(nowDate?: Date) {
    const inputWhere: FindCondition<UserEntity> = {
      state: UserState.SUSPENDED,
    }
    if (nowDate) {
      inputWhere.suspendedEndAt = LessThan(nowDate)
    }
    return await this.repository.find({ where: inputWhere })
  }

  /** 마지막 로그인 날짜가 1년이 넘은 유저들 */
  async lastLoginAtOneYear() {
    const preOneYearDate = DateTime.now().minus({ "year": 1 }).toJSDate()
    const inputWhere: FindCondition<UserEntity> = {
      lastLoginAt: LessThan(preOneYearDate),
      state: In([UserState.ACTIVE, UserState.SUSPENDED])
    }
    return await this.repository.find(inputWhere)
  }
}
