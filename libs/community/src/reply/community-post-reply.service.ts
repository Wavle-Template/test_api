import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { CRUDService } from "@yumis-coconudge/common-module";
import TypeORMHelper, { Edge, PageInfo, FilterArgs } from "@yumis-coconudge/typeorm-helper";
import { Repository } from "typeorm";
import { CommunityPostReplyEntity } from "./community-post-reply.entity";

@Injectable()
export class CommunityPostReplyService extends CRUDService<CommunityPostReplyEntity> {
  constructor(
    @InjectRepository(CommunityPostReplyEntity) communityPostReplyRepository: Repository<CommunityPostReplyEntity>
  ) {
    super(communityPostReplyRepository);
  }

  async addLike(id: string, userId: string): Promise<CommunityPostReplyEntity> {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["likes"] });
    const existLike = post.likes.find(like => like.id === userId);
    if (existLike) {
      throw new Error("이미 좋아요를 한 댓글입니다.");
    }
    const postWithNewLike = this.repository.merge(post, { likes: [...post.likes, { id: userId }] });
    postWithNewLike.likeCount = postWithNewLike.likes.length;
    return await this.repository.save(postWithNewLike);
  }

  async deleteLike(id: string, userId: string): Promise<CommunityPostReplyEntity> {
    const post = await this.repository.findOne({ where: { id: id }, relations: ["likes"] });
    const existLike = post.likes.find(like => like.id === userId);
    if (!existLike) {
      throw new Error("좋아요가 존재하지 않습니다.");
    }
    post.likes = post.likes.filter(like => like.id !== userId);
    post.likeCount = post.likes.length;
    return await this.repository.save(post);
  }
}
