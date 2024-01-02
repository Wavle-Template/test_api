import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { CRUDService } from '@yumis-coconudge/common-module';
import { DeepPartial, EntityManager, Repository } from 'typeorm';
import { MatchPostEntity } from './match-post.entity';
import { MatchPostStateEnum } from './match-post.enum';

@Injectable()
export class MatchPostService extends CRUDService<MatchPostEntity> {
    constructor(@InjectRepository(MatchPostEntity) MatchPostRepository: Repository<MatchPostEntity>) {
        super(MatchPostRepository);
    }

    async addLike(id: string, userId: string): Promise<MatchPostEntity> {
        const post = await this.repository.findOne({ where: { id: id }, relations: ["likes"] });
        const existLike = post?.likes?.find(like => like.id === userId);
        if (existLike) {
            throw new Error("이미 좋아요를 한 게시물입니다.");
        }
        const postWithNewLike = this.repository.merge(post, { likes: [...post.likes, { id: userId }] });
        await this.repository.save(postWithNewLike);
        await this.repository.increment({ id: id }, "likeCount", 1);
        return await this.findOne(id, ["author", "category", "files", "trader"])
    }

    async deleteLike(id: string, userId: string): Promise<MatchPostEntity> {
        const post = await this.repository.findOne({ where: { id: id }, relations: ["likes"] });
        const existLike = post?.likes?.find(like => like.id === userId);
        if (!existLike) {
            throw new Error("좋아요가 존재하지 않습니다.");
        }
        post.likes = post.likes.filter(like => like.id !== userId);
        await this.repository.save(post);
        await this.repository.decrement({ id: id }, "likeCount", 1);
        return await this.findOne(id, ["author", "category", "files", "trader"])
    }

    async updateFiles(id: string, fileIds: string[]): Promise<MatchPostEntity> {
        const post = (await this.repository.findOne({
            where: { id: id },
            relations: ["files"]
        })) as DeepPartial<MatchPostEntity>;
        post.files = fileIds.map(id => ({ id: id }));
        return await this.repository.save(post);
    }

    async incrementReplyCount(id: string): Promise<MatchPostEntity> {
        await this.repository.increment({ id: id }, "replyCount", 1);
        return await this.findOne(id, ["author", "category", "files", "trader"])
    }

    async decrementReplyCount(id: string): Promise<MatchPostEntity> {
        await this.repository.decrement({ id: id }, "replyCount", 1);
        return await this.findOne(id, ["author", "category", "files", "trader"])
    }

    async incrementViewCount(id: string): Promise<MatchPostEntity> {
        await this.repository.increment({ id: id }, "viewCount", 1);
        return await this.findOne(id, ["author", "category", "files", "trader"])
    }

    async decrementViewCount(id: string): Promise<MatchPostEntity> {
        await this.repository.decrement({ id: id }, "viewCount", 1);
        return await this.findOne(id, ["author", "category", "files", "trader"])
    }

    //TODO:block 유저 거르는 비즈니스는 어떻게 대입할건지?
    // async getEdgesByUser<TReturn = MatchPostEntity>(
    //     userId: string,
    //     args: PaginatedArgs,
    //     relations?: string[]
    // ): Promise<Edge<TReturn>[]> {
    //     const builder = this.getQueryBuilder("match_posts")
    //         .select("match_posts")
    //         .leftJoin(BlockedUserEntity, "blocked_users", "blocked_users.blocksId = :userId AND blocked_users.blockedId = match_posts.authorId", {
    //             userId: userId
    //         })
    //         .where("blocked_users.id IS NULL");

    //     return this.getEdgesWithBuilder(builder, args, relations);
    // }

    // async getPageInfoByUser(
    //     userId: string,
    //     edges: Edge<MatchPostEntity>[],
    //     args: PaginatedArgs,
    //     relations?: string[]
    // ): Promise<PageInfo> {
    //     const builder = this.getQueryBuilder("match_posts")
    //         .select("match_posts")
    //         .leftJoin(BlockedUserEntity, "blocked_users", "blocked_users.blocksId = :userId AND blocked_users.blockedId = match_posts.authorId", {
    //             userId: userId
    //         })
    //         .where("blocked_users.id IS NULL");

    //     return this.getPageInfoWithBuilder(builder, edges, args, relations);
    // }

    // async countByFilterArgsAndUser<TFilter>(
    //     userId: string,
    //     args: FilterArgs | { filter?: TFilter },
    //     relations?: string[]
    // ): Promise<number> {
    //     let builder = this.getQueryBuilder("match_posts")
    //         .select("match_posts")
    //         .leftJoin(BlockedUserEntity, "blocked_users", "blocked_users.blocksId = :userId AND blocked_users.blockedId = match_posts.authorId", {
    //             userId: userId
    //         })
    //         .where("blocked_users.id IS NULL");

    //     if (relations != null && relations.length > 0) {
    //         for (const relation of relations) {
    //             builder = builder.leftJoinAndSelect(`${builder.alias}.${relation}`, relation);
    //         }
    //     }
    //     builder = TypeORMHelper.filter(builder, args.filter as FilterArgs["filter"]);

    //     return await builder.getCount();
    // }

    async findNotMatched(transactionManager?: EntityManager) {
        return await this.useTransaction(async manage => {
            return await manage.find(MatchPostEntity, {
                where: {
                    state:MatchPostStateEnum.IN_PROGRESS
                }
            })
        }, transactionManager)
    }
}
