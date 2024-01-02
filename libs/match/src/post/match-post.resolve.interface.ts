import { AuthTokenPayload } from "@app/auth/token/payload.interface";
import { MatchPostEntity } from "./match-post.entity";
import { MatchPostCreateInput, MatchPostUpdateInput } from "./match-post.model";

export interface IMatchBusinessEssentialMutation {
    /**
     * 매칭 완료 처리
     * @param matchId 매칭 ID 
     * @param jwtPayload 토큰 값
     */
    matchPostEnd(matchId: string, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /**
     * 매칭 완료 처리 - 관리자용
     * @param matchId 매칭 ID
     * @param jwtPayload 토큰 값
     */
    matchPostEndForAdmin(matchId: string, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /**
     * 매칭 재오픈
     * @param matchId 매칭 ID
     * @param jwtPayload 토큰 값
     */
    reOpenMatchPost(matchId: string, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /**
     * 매칭 게시글 끌올
     * @param matchId 매칭 ID
     * @param jwtPayload 토큰 값
     */
    bumpMatchPost(matchId: string, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /**
     * 매칭 게시글 끌올 - 관리자용
     * @param matchId 매칭 ID
     * @param jwtPayload 토큰 값
     */
    bumpMatchPostForAdmin(matchId: string, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /**
     * 매칭 게시글 작성
     * @param data MatchPostCreateInput , 생성 Input Data
     * @param jwtPayload 토큰 값
     */
    createMatchPost(data: MatchPostCreateInput, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /**
     * 매칭 게시글 작성 - 관리자용
     * @param data MatchPostCreateInput , 생성 Input Data
     * @param jwtPayload 토큰 값
     */
    createMatchPostForAdmin(authorId: string, data: MatchPostCreateInput, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /**
     * 매칭 게시글 수정
     * @param id 매칭 ID
     * @param data MatchPostUpdateInput, 수정 Input Data
     * @param jwtPayload 토큰 값
     */
    updateMatchPost(id: string, data: MatchPostUpdateInput, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /**
     * 매칭 게시글 수정 - 관리자용
     * @param id 매칭 ID
     * @param data MatchPostUpdateInput, 수정 Input Data
     * @param jwtPayload 토큰 값
     */
    updateMatchPostForAdmin(id: string, data: MatchPostUpdateInput, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /**
     * 매칭 게시글 삭제
     * @param id 매칭 ID
     * @param jwtPayload 토큰 값
     */
    deleteMatchPost(id: string, jwtPayload: AuthTokenPayload): Promise<MatchPostEntity>;
    /** 매칭 게시글 삭제 - 관리자용
     * 매칭 게시글 삭제
     * @param id 매칭 ID
     * @param jwtPayload 토큰 값
     */
    deleteMatchPostsForAdmin(ids: string[], jwtPayload: AuthTokenPayload): Promise<MatchPostEntity[]>;
}