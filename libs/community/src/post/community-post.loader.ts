import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import DataLoader from "dataloader";
import { getConnection, In, Repository } from "typeorm";
import { CommunityPostEntity } from "./community-post.entity";

interface ILike {
  communityPostsId: string;
  usersId: string;
}

@Injectable()
export class CommunityPostForLikeLoader {
  #dataloader: DataLoader<ILike, ILike>;

  constructor() {
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
  }

  async batch(keys: ILike[]): Promise<ILike[]> {
    const userId = keys[0].usersId;
    const likes: ILike[] = await getConnection().query(
      `
        SELECT * FROM community_posts_likes_users as UserPostLike
        where UserPostLike."usersId" = $1
        and UserPostLike."communityPostsId" = any($2::uuid[])
        ORDER BY "communityPostsId" ASC, "usersId" ASC
        `,
      [userId, keys.map(key => key.communityPostsId)]
    );

    return keys.map(key => likes.find(like => like.communityPostsId === key.communityPostsId));
  }

  async get(key: ILike): Promise<ILike> {
    const like = await this.#dataloader.load(key);
    return like;
  }
}

@Injectable()
export class CommunityPostBasicLoader {
  #dataloader: DataLoader<string, CommunityPostEntity>;
  #communityPostRepository: Repository<CommunityPostEntity>;

  constructor(@InjectRepository(CommunityPostEntity) communityPostRepository: Repository<CommunityPostEntity>) {
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
    this.#communityPostRepository = communityPostRepository;
  }

  async batch(keys: string[]): Promise<CommunityPostEntity[]> {
    const posts = await this.#communityPostRepository.find({
      where: { id: In(keys) },
      relations: ["files", "hashtags", "usertags", "author"]
    });
    return keys.map(key => posts.find(post => post.id === key));
  }

  async get(id: string): Promise<CommunityPostEntity> {
    return await this.#dataloader.load(id);
  }
}

@Injectable()
export class CommunityPostByAuthorLoader {
  #dataloader: DataLoader<string, CommunityPostEntity[]>;
  #communityPostRepository: Repository<CommunityPostEntity>;

  constructor(@InjectRepository(CommunityPostEntity) communityPostRepository: Repository<CommunityPostEntity>) {
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
    this.#communityPostRepository = communityPostRepository;
  }

  async batch(keys: string[]): Promise<CommunityPostEntity[][]> {
    const posts = await this.#communityPostRepository.find({
      where: { author: { id: In(keys) } },
      relations: ["files", "hashtags", "usertags", "author"]
    });
    return keys.map(key => posts.filter(post => post.authorId === key));
  }

  async get(userId: string): Promise<CommunityPostEntity[]> {
    return await this.#dataloader.load(userId);
  }
}

@Injectable()
export class CommunityPostByAuthorForCountLoader {
  #dataloader: DataLoader<string, CommunityPostEntity[]>;
  #communityPostRepository: Repository<CommunityPostEntity>;

  constructor(@InjectRepository(CommunityPostEntity) communityPostRepository: Repository<CommunityPostEntity>) {
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
    this.#communityPostRepository = communityPostRepository;
  }

  async batch(keys: string[]): Promise<CommunityPostEntity[][]> {
    const posts = await this.#communityPostRepository.find({
      select: ["id"],
      where: { author: { id: In(keys) } },
      relations: ["author"]
    });
    return keys.map(key => posts.filter(post => post.author.id === key));
  }

  async get(userId: string): Promise<CommunityPostEntity[]> {
    return await this.#dataloader.load(userId);
  }
}

interface IHide {
  communityPostsId: string;
  usersId: string;
}

@Injectable()
export class CommunityPostForHideLoader {
  #dataloader: DataLoader<IHide, IHide>;

  constructor() {
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
  }

  async batch(keys: IHide[]): Promise<IHide[]> {
    const userId = keys[0].usersId;
    const hide_list: IHide[] = await getConnection().query(
      `
        SELECT * FROM community_posts_hide_users as UserPostHide
        where UserPostHide."usersId" = $1
        and UserPostHide."communityPostsId" = any($2::uuid[])
        ORDER BY "communityPostsId" ASC, "usersId" ASC
        `,
      [userId, keys.map(key => key.communityPostsId)]
    );

    return keys.map(key => hide_list.find(hide => hide.communityPostsId === key.communityPostsId));
  }

  async get(key: IHide): Promise<IHide> {
    const hide = await this.#dataloader.load(key);
    return hide;
  }
}

@Injectable()
export class CommunityPostByAuthorForLikeCountLoader {
  #dataloader: DataLoader<string, number>;
  #communityPostRepository: Repository<CommunityPostEntity>;

  constructor(@InjectRepository(CommunityPostEntity) communityPostRepository: Repository<CommunityPostEntity>) {
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
    this.#communityPostRepository = communityPostRepository;
  }

  async batch(keys: string[]): Promise<number[]> {
    const likes: {userId:string,cnt:number}[] = keys.length > 0 ? await getConnection().query(
      `
      select cprlu."usersId" as "userId", count(*) as "cnt" from community_post_replies_likes_users as cprlu where cprlu."userId" in ($1) group by cprlu."usersId"  
      `,
      [keys]
    ) : []
    return keys.map(key =>
     likes.find(like => like.userId === key).cnt ?? 0
    );
  }

  async get(userId: string): Promise<number> {
    return await this.#dataloader.load(userId);
  }
}

@Injectable()
export class CommunityPostByAuthorForHideCountLoader {
  #dataloader: DataLoader<string, number>;
  #communityPostRepository: Repository<CommunityPostEntity>;

  constructor(@InjectRepository(CommunityPostEntity) communityPostRepository: Repository<CommunityPostEntity>) {
    this.#dataloader = new DataLoader(this.batch.bind(this), { cache: false });
    this.#communityPostRepository = communityPostRepository;
  }

  async batch(keys: string[]): Promise<number[]> {
    const likes: { userId: string, cnt: number }[] = keys.length > 0 ? await getConnection().query(
      `
      select cprlu."usersId" as "userId", count(*) as "cnt" from community_post_replies_hide_users as cprlu where cprlu."userId" in ($1) group by cprlu."usersId"  
      `,
      [keys]
    ) : []
    return keys.map(key =>
      likes.find(like => like.userId === key).cnt ?? 0
    );
  }

  async get(userId: string): Promise<number> {
    return await this.#dataloader.load(userId);
  }
}