import { UserBlockEntity } from "@app/entity";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { CRUDService } from "@yumis-coconudge/common-module";
import { Edge, FilterArgs, MixedArgs, PageInfo } from "@yumis-coconudge/typeorm-helper";
import { DeepPartial, EntityManager, EntityTarget, FindManyOptions, In } from "typeorm";
import { BusinessChatChannelParticipantEntity } from "../entity/b-chat-channel-participant.entity";
import { BusinessChatChannelEntity } from "../entity/b-chat-channel.entity";
import { ChatChannelParticipantEntity } from "../entity/chat-channel-participant.entity";
import { ChatChannelEntity } from "../entity/chat-channel.entity";

export abstract class AbsChatChannelService<
    TEntity extends ChatChannelEntity | BusinessChatChannelEntity,
    PEntity extends ChatChannelParticipantEntity | BusinessChatChannelParticipantEntity
> extends CRUDService<TEntity>{
    #participantTableName: string;
    constructor(
        entityManager: EntityManager,
        public inputEntityTarget: EntityTarget<TEntity>,
        public inputParticipantEntityTarget: EntityTarget<PEntity>,
    ) {
        super(entityManager, inputEntityTarget);
        this.#participantTableName = this.entityManager.getRepository(this.inputParticipantEntityTarget).metadata.tableName;
    }

    /**
     * 특정 사용자를 특정 채널에 입장합니다.
     * @param channelId 참가할 채널 ID
     * @param userId 참가할 사용자 ID
     * @returns 채팅 채널 엔티티
     */
    async join(channelId: string, userId: string): Promise<TEntity> {
        return this.entityManager.transaction(async manager => {
            const channel = await manager.findOneOrFail(this.inputEntityTarget, channelId, { relations: ["participants"] });
            const isJoined = channel.participants?.some(participant => participant.userId === userId) ?? false;
            if (isJoined === true) throw new BadRequestException("이미 참여중인 채널입니다.");
            const participant = manager.create<PEntity>(this.inputParticipantEntityTarget, {
                channelId: channelId,
                userId: userId
            } as DeepPartial<PEntity>)
            participant.channelId = channelId;
            participant.userId = userId;
            // const participant = manager.create(this.inputParticipantEntityTarget, {
            //   channelId:channelId,
            //   userId:userId
            // });
            await manager.save(participant);

            return await manager.findOne(this.inputEntityTarget, channelId);
        });
    }

    /**
     * 특정 사용자를 특정 채널에서 퇴장합니다.
     * @param channelId 퇴장할 채널 ID
     * @param userId 퇴장할 사용자 ID
     * @returns 채팅 채널 엔티티
     */
    async leave(channelId: string, userId: string, transactionManager?: EntityManager): Promise<TEntity> {
        return await this.useTransaction(async manager => {
            const channel = await manager.findOneOrFail(this.inputEntityTarget, channelId, { relations: ["participants"] });
            const participant = channel.participants?.find(participant => participant.userId === userId);
            if (participant == null) throw new BadRequestException("참여하지 않은 채널입니다.");

            await manager.softRemove(participant);
            return await manager.findOne(this.inputEntityTarget, channelId);

        }, transactionManager)
    }

    /**
     * 특정 사용자를 특정 채널들에서 퇴장합니다.
     * @param channelIds 퇴장할 채널 ID 목록
     * @param userId 퇴장할 사용자 ID
     * @returns 채팅 채널 엔티티 목록
     */
    async leaveMany(channelIds: string[], userId: string, transactionManager?: EntityManager): Promise<TEntity[]> {
        return await this.useTransaction(async manager => {
            const channels = await manager.find(this.inputEntityTarget, {
                where: { id: In(channelIds) },
                relations: ["participants"],
            });

            if (channels.length <= 0) return [];

            const participants = channels
                .map(channel => channel.participants)
                .flat()
                .filter(participant => participant.userId === userId);

            await manager.softRemove(participants);
            return await manager.find(this.inputEntityTarget, {
                where: { id: In(channelIds) },
            });
        }, transactionManager)
    }

    /**
     * 채팅 채널을 목록에서 최상단 고정합니다.
     * @param channelId 고정할 채널 ID
     * @param userId 사용자 ID
     * @param isPinned 고정 여부
     */
    async setPin(channelId: string, userId: string, isPinned: boolean, transactionManager?: EntityManager): Promise<void> {
        return await this.useTransaction(async manager => {
            const channel = await manager.findOneOrFail(this.inputEntityTarget, channelId, { relations: ["participants"] });
            const participant = channel.participants.find(participant => participant.userId === userId);
            participant.isPinned = isPinned;
            await manager.save(participant);
        }, transactionManager)
    }

    async getEdges(args: MixedArgs, builder = this.getQueryBuilder("chat_channels")): Promise<Edge<TEntity>[]> {
        builder = builder
            .distinct(true)
            .select("chat_channels")
            .leftJoinAndSelect("chat_channels.participants", "participants")
            .leftJoin("participants.user", "participant_users")
            .orderBy("participants.isPinned", "DESC")
            .addOrderBy("chat_channels.updatedAt", "DESC")
            .addOrderBy("chat_channels.id", "ASC");

        return super.getEdges(args, builder);
    }

    async getPageInfo(
        edges: Edge<TEntity>[],
        args: MixedArgs,
        builder = this.getQueryBuilder("chat_channels"),
    ): Promise<PageInfo> {
        builder = builder
            .distinct(true)
            .select("chat_channels")
            .leftJoinAndSelect("chat_channels.participants", "participants")
            .leftJoin("participants.user", "participant_users")
            .orderBy("participants.isPinned", "DESC")
            .addOrderBy("chat_channels.updatedAt", "DESC")
            .addOrderBy("chat_channels.id", "ASC");

        return super.getPageInfo(edges, args, builder);
    }

    async countByFilterArgs(args: FilterArgs, builder = this.getQueryBuilder("chat_channels")): Promise<number> {
        builder = builder
            .select("chat_channels")
            .leftJoinAndSelect("chat_channels.participants", "participants")
            .leftJoin("participants.user", "participant_users");

        return super.countByFilterArgs(args, builder);
    }

    async getEdgesByUser(
        userId: string,
        args: MixedArgs,
        builder = this.getQueryBuilder("chat_channels"),
    ): Promise<Edge<TEntity>[]> {
        builder = builder
            .distinct(true)
            .select("chat_channels")
            .leftJoinAndSelect("chat_channels.participants", "participants")
            .leftJoin("participants.user", "participant_users")
            .where(qb => {
                const subQuery = qb
                    .subQuery()
                    .select("blocks.id")
                    .from(UserBlockEntity, "blocks")
                    .leftJoin(
                        this.#participantTableName,
                        "chat_channel_participants",
                        "chat_channel_participants.channelId = chat_channels.id",
                    )
                    .where("blocks.sourceId = :userId", { userId: userId })
                    .andWhere("blocks.destinationId = chat_channel_participants.userId")
                    .getQuery();

                return `NOT EXISTS (${subQuery})`;
            })
            .andWhere("participants.userId = :userId", { userId: userId })
            .orderBy("participants.isPinned", "DESC")
            .addOrderBy("chat_channels.updatedAt", "DESC")
            .addOrderBy("chat_channels.id", "ASC");

        return super.getEdges(args, builder);
    }

    async getPageInfoByUser(
        userId: string,
        edges: Edge<TEntity>[],
        args: MixedArgs,
        builder = this.getQueryBuilder("chat_channels"),
    ): Promise<PageInfo> {
        builder = builder
            .distinct(true)
            .select("chat_channels")
            .leftJoinAndSelect("chat_channels.participants", "participants")
            .leftJoin("participants.user", "participant_users")
            .where(qb => {
                const subQuery = qb
                    .subQuery()
                    .select("blocks.id")
                    .from(UserBlockEntity, "blocks")
                    .leftJoin(
                        this.#participantTableName,
                        "chat_channel_participants",
                        "chat_channel_participants.channelId = chat_channels.id",
                    )
                    .where("blocks.sourceId = :userId", { userId: userId })
                    .andWhere("blocks.destinationId = chat_channel_participants.userId")
                    .getQuery();

                return `NOT EXISTS (${subQuery})`;
            })
            .andWhere("participants.userId = :userId", { userId: userId })
            .orderBy("participants.isPinned", "DESC")
            .addOrderBy("chat_channels.updatedAt", "DESC")
            .addOrderBy("chat_channels.id", "ASC");

        return super.getPageInfo(edges, args, builder);
    }

    async countByFilterArgsAndUser(userId: string, args: FilterArgs, relations?: string[]): Promise<number> {
        let builder = this.getQueryBuilder("chat_channels")
            .distinct(true)
            .select("chat_channels")
            .leftJoinAndSelect("chat_channels.participants", "participants")
            .leftJoin("participants.user", "participant_users")
            .where(qb => {
                const subQuery = qb
                    .subQuery()
                    .select("blocks.id")
                    .from(UserBlockEntity, "blocks")
                    .leftJoin(
                        this.#participantTableName,
                        "chat_channel_participants",
                        "chat_channel_participants.channelId = chat_channels.id",
                    )
                    .where("blocks.blocksId = :userId", { userId: userId })
                    .andWhere("blocks.blockedId = chat_channel_participants.userId")
                    .getQuery();

                return `NOT EXISTS (${subQuery})`;
            })
            .andWhere("participants.userId = :userId", { userId: userId });

        return super.countByFilterArgs(args, builder);
    }

    async softDeleteOne(id: string, transactionManager?: EntityManager): Promise<TEntity> {
        return this.useTransaction(async manager => {
            const channel = await manager.findOneOrFail(this.inputEntityTarget, id, {
                relations: ["participants", "messages"],
            });

            await manager.softRemove(channel.participants);
            await manager.softRemove(channel.messages);
            return await manager.softRemove(channel);
        }, transactionManager);
    }

    async softDeleteMany(ids: string[], transactionManager?: EntityManager): Promise<TEntity[]> {
        return this.useTransaction(async manager => {
            let channels = await manager.find(this.inputEntityTarget, {
                where: { id: In(ids) },
                relations: ["participants", "messages"],
            });

            if (channels.length <= 0) throw new NotFoundException("찾을 수 없습니다.");

            await manager.softRemove(channels.map(channel => channel.participants).flat());
            await manager.softRemove(channels.map(channel => channel.messages).flat());
            return await manager.softRemove(channels);
        }, transactionManager);
    }

    async deleteOne(id: string, transactionManager?: EntityManager): Promise<TEntity> {
        return this.useTransaction(async manager => {
            const channel = await manager.findOneOrFail(this.inputEntityTarget, id, {
                relations: ["participants", "messages"],
            });

            await manager.remove(channel.participants);
            await manager.remove(channel.messages);
            return await manager.remove(channel);
        }, transactionManager);
    }

    async deleteMany(ids: string[], transactionManager?: EntityManager): Promise<TEntity[]> {
        return this.useTransaction(async manager => {
            let channels = await manager.find(this.inputEntityTarget, {
                where: { id: In(ids) },
                relations: ["participants", "messages"],
            });

            if (channels.length <= 0) throw new NotFoundException("찾을 수 없습니다.");

            await manager.remove(channels.map(channel => channel.participants).flat());
            await manager.remove(channels.map(channel => channel.messages).flat());
            return await manager.remove(channels);
        }, transactionManager);
    }

    async findPinnedChatByUserId(userId: string) {
        const list = await this.entityManager.find<PEntity>(this.inputParticipantEntityTarget, {
            where: {
                userId: userId,
                isPinned: true
            },
            relations: ["channel"]
        } as FindManyOptions<PEntity>);
        return list.map(item => item.channel)
    }

    async isJoinChat(chatId: string, userId: string) {
        const cnt = await this.entityManager.count(this.inputParticipantEntityTarget, {
            where: {
                channelId: chatId,
                userId: userId
            }
        })
        return cnt > 0 ? true : false
    }

    async findJoinTarget(targetId: string, userId: string) {
        const colums = this.entityManager.getRepository(this.inputEntityTarget).metadata.ownColumns.map(column => column.propertyName);
        const isExistColum = colums.findIndex(item => item === "targetId");
        if (isExistColum === -1) {
            throw new Error("잘못된 채팅 참가자 테이블");
        }
        const list = await this.entityManager.createQueryBuilder()
            .from(this.inputEntityTarget, "channels")
            .leftJoinAndSelect("channels.participants", "participants")
            .where("channels.targetId = :targetId", { targetId: targetId })
            .andWhere("participants.userId = :userId", { userId: userId })
            .getMany()
        return list;
    }

}