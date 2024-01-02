import { ChatReportCategory, ChatReportType, ChatReportState, ChatReportCreateInput, ChatReportUpdateInput, ChatReportListArgs } from "@app/common-chat-res";
import { ArgsType, Field, InputType, ObjectType } from "@nestjs/graphql";
import { DefaultModel, Pagination } from "@yumis-coconudge/common-module";

@ObjectType({ description: "비즈니스 채팅 신고 모델" })
export class BusinessChatReport extends DefaultModel {

    // @Field(type => User, { description: "작성자", nullable: true })
    // author: User;

    @Field({ description: "신고 타겟", nullable: true })
    targetId: string;

    /** 신고내용 */
    @Field({ description: "신고 내용", nullable: true })
    content: string;

    /** 신고 종류 */
    @Field(type => ChatReportCategory, { description: "신고 카테고리", nullable: true })
    category: string;

    /** 기타 예비용 컬럼 */
    @Field({ description: "기타 예비용 필드", nullable: true })
    etc?: string;

    /** 관리자 메모 */
    // @Field({ description: "신고 내용", nullable: true })
    // adminMemo?: string;

    /** 타입 */
    @Field(type => ChatReportType, { description: "신고 종류", nullable: true })
    type: string;

    /** 상태 */
    @Field(type => ChatReportState, { description: "신고 상태", nullable: true })
    state: string;

    /** 참고 이미지 */
    // @Field(type => [GraphQLFile], { description: "이미지, 영상 목록", nullable: true })
    // files?: GraphQLFile[];
}

@ObjectType({ description: "비즈니스 채팅 신고 목록" })
export class BusinessChatReportList extends Pagination(BusinessChatReport) { }

@InputType({ description: "비즈니스 채팅 신고 생성" })
export class BusinessChatReportCreateInput extends ChatReportCreateInput { }

@InputType({ description: "채팅 신고 수정" })
export class BusinessChatReportUpdateInput extends ChatReportUpdateInput { }

@ArgsType()
export class BusinessChatReportListArgs extends ChatReportListArgs { }