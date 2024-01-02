/**
 * @module FileModule
 */
import { Field, Int, ObjectType } from "@nestjs/graphql";
import { EssentialModel } from "@yumis-coconudge/common-module";

/**
 * 파일
 * @category GraphQL Object Type
 */
@ObjectType("File", { description: "파일" })
export class GraphQLFile extends EssentialModel {
    /** 원본 이름 */
    @Field(type => String, { description: "원본 이름" })
    filename: string;

    /** MIME 타입 */
    @Field(type => String, { description: "MIME 타입" })
    mimetype: string;

    /** MD5 체크섬 */
    @Field(type => String, { description: "MD5 체크섬" })
    md5: string;

    /** 파일 크기 (바이트) */
    @Field(type => Int, { description: "파일 크기 (바이트)" })
    size: number;

    /** 우선 순위 (정렬용) */
    @Field(type => Int, { description: "우선 순위 (정렬용)", defaultValue: 0 })
    priority: number;
}
