import DataLoader from "dataloader";
import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { getConnection, In, Repository } from "typeorm";
import { CommunityPostReplyEntity } from "./community-post-reply.entity";

interface ILike {
  communityPostRepliesId: string;
  usersId: string;
}

@Injectable()
export class CommunityPostReplyForLikeLoader {
  #dataloader: DataLoader<ILike, ILike>;

  constructor() {
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
  }

  async batch(keys: ILike[]): Promise<ILike[]> {
    const userId = keys[0].usersId;
    const likes: ILike[] = await getConnection().query(
      `
      SELECT * FROM community_post_replies_likes_users as UserPostReplyLike
      where UserPostReplyLike."usersId" = $1
      and UserPostReplyLike."communityPostRepliesId" = any($2::uuid[])
      ORDER BY "communityPostRepliesId" ASC, "usersId" ASC
      `,
      [userId, keys.map(key => key.communityPostRepliesId)]
    );
    return keys.map(key =>
      likes.find(like => like.usersId === key.usersId && like.communityPostRepliesId === key.communityPostRepliesId)
    );
  }

  async get(key: ILike): Promise<ILike> {
    const like = await this.#dataloader.load(key);
    return like;
  }
}

@Injectable()
export class CommunityPostReplyByPostLoader {
  #communityPostReplyRepository: Repository<CommunityPostReplyEntity>;
  #dataloader: DataLoader<string, CommunityPostReplyEntity[]>;

  constructor(
    @InjectRepository(CommunityPostReplyEntity) communityPostReplyRepository: Repository<CommunityPostReplyEntity>
  ) {
    this.#communityPostReplyRepository = communityPostReplyRepository;
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
  }

  async batch(keys: string[]): Promise<CommunityPostReplyEntity[][]> {
    const replies = await this.#communityPostReplyRepository.find({
      where: { post: { id: In(keys) } },
      relations: ["post", "author"]
    });
    return keys.map(key => replies.filter(reply => reply.post.id === key));
  }

  async get(postId: string): Promise<CommunityPostReplyEntity[]> {
    const replies = await this.#dataloader.load(postId);
    return replies;
  }
}

@Injectable()
export class CommunityPostReplyByParentReplyLoader {
  #communityPostReplyRepository: Repository<CommunityPostReplyEntity>;
  #dataloader: DataLoader<string, CommunityPostReplyEntity[]>;

  constructor(
    @InjectRepository(CommunityPostReplyEntity) communityPostReplyRepository: Repository<CommunityPostReplyEntity>
  ) {
    this.#communityPostReplyRepository = communityPostReplyRepository;
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
  }

  async batch(keys: string[]): Promise<CommunityPostReplyEntity[][]> {
    const replies = await this.#communityPostReplyRepository.find({
      where: { parent: { id: In(keys) } },
      relations: ["parent", "author"]
    });
    return keys.map(key => replies.filter(reply => reply.parent.id === key));
  }

  async get(parentId: string): Promise<CommunityPostReplyEntity[]> {
    const replies = await this.#dataloader.load(parentId);
    return replies;
  }
}

@Injectable()
export class CommunityPostReplyBasicLoader {
  #communityPostReplyRepository: Repository<CommunityPostReplyEntity>;
  #dataloader: DataLoader<string, CommunityPostReplyEntity>;

  constructor(
    @InjectRepository(CommunityPostReplyEntity) communityPostReplyRepository: Repository<CommunityPostReplyEntity>
  ) {
    this.#communityPostReplyRepository = communityPostReplyRepository;
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
  }

  async batch(keys: string[]): Promise<CommunityPostReplyEntity[]> {
    const replies = await this.#communityPostReplyRepository.find({
      where: { id: In(keys) },
      relations: ["parent", "usertags", "author", "post"]
    });
    return keys.map(key => replies.find(reply => reply.id === key));
  }

  async get(id: string): Promise<CommunityPostReplyEntity> {
    const replie = await this.#dataloader.load(id);
    return replie;
  }
}
