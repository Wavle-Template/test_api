import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import { DeepPartial, Repository } from "typeorm";
import { CommunityPostEntity } from "./community-post.entity";

@Injectable()
export class CommunityPostService extends CRUDService<CommunityPostEntity> {
  constructor(@InjectRepository(CommunityPostEntity) communityPostRepository: Repository<CommunityPostEntity>) {
    super(communityPostRepository);
  }

  async addLike(id: string, userId: string): Promise<CommunityPostEntity> {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["likes"] });
    const existLike = post.likes.find(like => like.id === userId);
    if (existLike) {
      throw new Error("이미 좋아요를 한 게시물입니다.");
    }
    const postWithNewLike = this.repository.merge(post, { likes: [...post.likes, { id: userId }] });
    postWithNewLike.likeCount = postWithNewLike.likes.length;
    return await this.repository.save(postWithNewLike);
  }

  async deleteLike(id: string, userId: string): Promise<CommunityPostEntity> {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["likes"] });
    const existLike = post.likes.find(like => like.id === userId);
    if (!existLike) {
      throw new Error("좋아요가 존재하지 않습니다.");
    }
    post.likes = post.likes.filter(like => like.id !== userId);
    post.likeCount = post.likes.length;
    return await this.repository.save(post);
  }


  async updateFiles(id: string, fileIds: string[]): Promise<CommunityPostEntity> {
    const post = (await this.repository.findOne({
      where: { id: id },
      relations: ["files"]
    })) as DeepPartial<CommunityPostEntity>;

    post.files = fileIds.map(id => ({ id: id }));

    return await this.repository.save(post);
  }

  async incrementReplyCount(id: string): Promise<CommunityPostEntity> {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["likes"] });
    if (post === undefined) {
      throw new Error("NOT_FOUND");
    }
    return await this.updateOne(post.id, { replyCount: post.replyCount + 1 })
  }

  async decrementReplyCount(id: string): Promise<CommunityPostEntity> {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["likes"] });
    if (post === undefined) {
      throw new Error("NOT_FOUND");
    }
    return await this.updateOne(post.id, { replyCount: post.replyCount - 1 })
  }

  async incrementViewCount(id: string, userId: string) {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["views"] });
    const existLike = post.views.find(like => like.id === userId);
    if (existLike === undefined) {
      const postWithNewLike = this.repository.merge(post, { views: [...post.views, { id: userId }] });
      postWithNewLike.viewCount = postWithNewLike.views.length;
      return await this.repository.save(postWithNewLike);
    } else {
      return post
    }
  }

  async decrementViewCount(id: string, userId: string) {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["views"] });
    const existLike = post.views.find(like => like.id === userId);
    if (existLike) {
      post.views = post.views.filter(like => like.id !== userId);
      post.viewCount = post.views.length;
      return await this.repository.save(post);
    } else {
      return post
    }
  }

  async addHide(id: string, userId: string): Promise<CommunityPostEntity> {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["hide"] });
    const existHide = post.likes.find(like => like.id === userId);
    if (existHide) {
      throw new Error("이미 좋아요를 한 게시물입니다.");
    }
    const postWithNewLike = this.repository.merge(post, { hide: [...post.hide, { id: userId }] });
    postWithNewLike.hideCount = postWithNewLike.hide.length;
    return await this.repository.save(postWithNewLike);
  }

  async deleteHide(id: string, userId: string): Promise<CommunityPostEntity> {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["hide"] });
    const existHide = post.hide.find(like => like.id === userId);
    if (!existHide) {
      throw new Error("좋아요가 존재하지 않습니다.");
    }
    post.hide = post.hide.filter(hide => hide.id !== userId);
    post.hideCount = post.hide.length;
    return await this.repository.save(post);
  }

}
