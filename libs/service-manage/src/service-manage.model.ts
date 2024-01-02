import { Field, InputType, ObjectType, PartialType } from "@nestjs/graphql";
import { DefaultModel, GraphQLJSON, Pagination } from "@yumis-coconudge/common-module";

@ObjectType({ description: "서비스 운영 정보" })
export class ServiceManage extends DefaultModel {

    @Field(type => String, { description: "대표자명", nullable: true })
    representativeName?: string;

    @Field(type => String, { description: "사업자등록번호", nullable: true })
    businessLicense?: string;

    @Field(type => String, { description: "사업지 주소", nullable: true })
    companyAddress?: string;

    @Field(type => String, { description: "서비스이용약관", nullable: true })
    serviceTerms?: string;

    @Field(type => String, { description: "환불규정", nullable: true })
    refundTerms?: string;

    @Field(type => String, { description: "마켓팅규정", nullable: true })
    marketingTerms?: string;

    @Field(type => String, { description: "개인정보처리방침", nullable: true })
    personalProcessingPolicy?: string;
    
    @Field(type => [OpenSourceModel], { description: "오픈소스 리스트", nullable: true })
    openSource?: OpenSourceModel[];
}

@InputType({description:"서비스 운영정보 Update Input"})
export class ServiceManageUpdateInput {
    @Field(type => String, { description: "대표자명", nullable: true })
    representativeName?: string;

    @Field(type => String, { description: "사업자등록번호", nullable: true })
    businessLicense?: string;

    @Field(type => String, { description: "사업지 주소", nullable: true })
    companyAddress?: string;

    @Field(type => String, { description: "서비스이용약관", nullable: true })
    serviceTerms?: string;

    @Field(type => String, { description: "환불규정", nullable: true })
    refundTerms?: string;

    @Field(type => String, { description: "마켓팅규정", nullable: true })
    marketingTerms?: string;

    @Field(type => String, { description: "개인정보처리방침", nullable: true })
    personalProcessingPolicy?: string;

    // @Field(type => GraphQLJSON, { description: "오픈소스 리스트", nullable: true })
    // openSource?: Record<string, unknown>;
}

@ObjectType({description:"OpenSource모델"})
export class OpenSourceModel {
    @Field(type => String, { description: "소스명", nullable: true })
    name: string;
    @Field(type => String, { description: "게시자", nullable: true })
    publisher: string;
    @Field(type => String, { description: "라이센스 URL", nullable: true })
    licenseFileUrl: string;
    @Field(type => String, { description: "라이센스 종류", nullable: true })
    licenses: string;
    @Field(type => String, { description: "이메일", nullable: true })
    email: string;
    @Field(type => String, { description: "저장소", nullable: true })
    repository: string;
}