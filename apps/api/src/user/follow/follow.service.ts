/**
 * @module UserFollowModule
 */
import { FollowCommonService } from "@app/follow-generate";
import { Injectable } from "@nestjs/common";

/**
 * 사용자 팔로우, 팔로워을 관리하기 위한 서비스
 * @category Provider
 */
@Injectable()
export class UserFollowService extends FollowCommonService { }