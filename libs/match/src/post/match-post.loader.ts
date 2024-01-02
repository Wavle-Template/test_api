import { FileEntity } from "@app/entity";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import LRUCache from "lru-cache";
import { In, Repository } from "typeorm";
import { MatchPostEntity } from "./match-post.entity";
interface ILike {
    matchPostsId: string;
    usersId: string;
}

@Injectable()
export class MatchPostBasicLoader {
    #repository: Repository<MatchPostEntity>;

    /** 매칭 게시글 */
    #match: DataLoader<string, MatchPostEntity>;
    /** 좋아요 */
    #like: DataLoader<ILike, boolean>

    /** 작성 게시글 수 */
    #matchCnt: DataLoader<string, number>;

    /** 첨부파일 */
    #files: DataLoader<string, FileEntity[]>;

    constructor(@InjectRepository(MatchPostEntity) matchPostRepository: Repository<MatchPostEntity>) {
        this.#repository = matchPostRepository;

        this.#match = new DataLoader(
            async (keys: string[]) => {
                const messages = await this.#repository.find({
                    where: { id: In(keys) },
                    relations: ["files"]
                });

                return keys.map(key => messages.find(message => message.id === key));
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        )

        this.#like = new DataLoader(
            async (keys: ILike[]) => {
                const userId = keys[0].usersId;
                const likes: ILike[] = await this.#repository.query(`
                    select * from match_post_likes as mpl where mpl."usersId" = $1
                    and mpl."matchPostsId" = any($2::uuid[])
                `,
                [userId,keys.map(key=>key.matchPostsId)]
                )

                return keys.map(key =>
                    likes.some(like => like.usersId === key.usersId && like.matchPostsId === key.matchPostsId)
                );
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        )

        this.#matchCnt = new DataLoader(
            async (keys: string[]) => {
                const datas: { authorId: string, cnt: number }[] = await this.#repository.createQueryBuilder("matches")
                    .where("matches.authorId in (:...authorIds)", { authorId: keys })
                    .groupBy("matches.authorId")
                    .select("matches.authorId", "authorId")
                    .addSelect("count(*)::INTEGER", "cnt")
                    .getRawMany();
                return keys.map(key => datas.find(item => key === item.authorId).cnt ?? 0);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        )

        this.#files = new DataLoader(
            async (keys: string[]) => {
                const matches = await this.#repository.find({
                    where: {
                        id: In(keys)
                    },
                    relations: ["files"]
                })
                return keys.map(key => matches.find(item => key === item.id).files ?? []);
            },
            { cacheMap: new LRUCache({ max: 100, ttl: 30000 }) },
        )

    }

    async getMatch(id: string): Promise<MatchPostEntity> {
        return await this.#match.load(id);
    }

    async getIsLike(input: ILike): Promise<boolean> {
        return await this.#like.load(input);
    }

    async getMatchPostCnt(id: string): Promise<number> {
        return await this.#matchCnt.load(id);
    }

    async getFiles(id: string): Promise<FileEntity[]> {
        return await this.#files.load(id);
    }

}