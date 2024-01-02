import { UseGuards } from '@nestjs/common';
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from '@nestjs/graphql';
import { BadRequestGraphQLError, NotFoundGraphQLError } from '@yumis-coconudge/common-module';
import dedent from 'dedent';
import { GraphQLResolveInfo } from 'graphql';
import { UserRole } from '@app/entity';
import { UserLoader } from '../user/user.loader';
import { InquireListArgs } from './inquire.args';
import { InquireEntity } from './inquire.entity';
import { InquireLoader } from './inquire.loader';
import { Inquire, InquireList } from './inquire.model';
import { InquireService } from './inquire.service';
import * as graphqlFields from 'graphql-fields'
import { Edge } from '@yumis-coconudge/typeorm-helper';
import { InquireCreateInput, InquireUpdateInput, InquireUpdateInputForAdmin } from './inquire.input';
import { InquireState } from './inquire.enum';
import { NotificationService } from '../notification/notification.service';
import { JwtGuard } from '@app/auth/guards/jwt.guard';
import { UserRoleGuard } from '@app/auth/guards/role.guard';
import { Roles } from '@app/auth/decorators/roles.decorator';
import { CurrentJwtPayload } from '@app/auth/decorators/current-jwt-payload.decorator';
import { AuthTokenPayload } from '@app/auth/token/payload.interface';
import { User } from '@app/user/user.model';
import { GraphQLFile } from '@app/file';
import { OpenGuard } from '@app/auth/guards/open.guard';
import { NotificationType } from '@app/entity/notification/notification.enum';

@Resolver(of => Inquire)
export class InquireResolver {

    constructor(
        public inquireService: InquireService,
        public userLoader: UserLoader,
        public inquireLoder: InquireLoader,
        public notificationService: NotificationService
    ) {

    }

    @Query(returns => Inquire, {
        description: dedent`
    문의 내용을 가져옵니다. - 관리자용

    **에러 코드**
      - \`NOT_FOUND\`: 해당 문의를 찾을 수 없습니다.
    `})
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async inquireForAdmin(
        @Args("id", { type: () => ID, description: "문의 아이디" }) id: string
    ) {
        const info = await this.inquireService.findOne(id);
        if (info === null) {
            throw new NotFoundGraphQLError("해당 문의를 찾을 수 없습니다.");
        }
        return info;
    }

    @Query(returns => Inquire, {
        description: dedent`
    문의 내용을 가져옵니다.

    **에러 코드**
      - \`NOT_FOUND\`: 해당 문의를 찾을 수 없습니다.
    `})
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.MEMBER)
    async inquire(
        @Args("id", { type: () => ID, description: "문의 아이디" }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ) {
        const info = await this.inquireService.findOne(id, ["author"]);
        if (info === null) {
            throw new NotFoundGraphQLError("해당 문의를 찾을 수 없습니다.");
        } else if (info.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError("해당 문의를 찾을 수 없습니다.");
        }
        return info;
    }

    @Query(returns => InquireList, {
        description: dedent`
        문의 리스트를 가져옵니다. - 관리자용

        [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async inquiresForAdmin(
        @Args() args: InquireListArgs,
        @Info() info: GraphQLResolveInfo,
    ) {
        const fields = graphqlFields(info);
        let result: Partial<InquireList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.inquireService.countByFilterArgs(args),
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.inquireService.getEdges(args);
            result = {
                ...result,
                edges: edges as unknown as Edge<Inquire>[],
                pageInfo: await this.inquireService.getPageInfo(edges, args),
            };
        }
        return result as InquireList;
    }

    @Query(returns => InquireList, {
        description: dedent`
        내 문의 리스트를 가져옵니다.

        [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.MEMBER)
    async myInquires(
        @Args() args: InquireListArgs,
        @Info() info: GraphQLResolveInfo,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ) {
        const fields = graphqlFields(info);
        let result: Partial<InquireList> = {};

        if ("totalCount" in fields) {
            result = {
                ...result,
                totalCount: await this.inquireService.countByUserId(jwtPayload.id, args),
            };
        }
        if ("edges" in fields || "pageInfo" in fields) {
            const edges = await this.inquireService.getEdgesByUserId(jwtPayload.id, args);
            result = {
                ...result,
                edges: edges as unknown as Edge<Inquire>[],
                pageInfo: await this.inquireService.getPageInfoByUserId(jwtPayload.id, edges, args),
            };
        }
        return result as InquireList;
    }

    @Mutation(returns => Inquire, {
        description: dedent`
        문의 생성하기
        `
    })
    @UseGuards(JwtGuard)
    async createInquire(
        @Args("data") data: InquireCreateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ) {
        const { fileIds: file__ids, ...otherData } = data;
        return (await this.inquireService.createOne({
            ...otherData,
            author: { id: jwtPayload.id },
            files: file__ids ? file__ids.map(id => ({ id: id })) : null,
        })) as Inquire;
    }

    @Mutation(returns => Inquire, {
        description: dedent`
        문의 수정하기

        **에러 코드**
        - \`NOT_FOUND\`: 존재하지 않는 문의입니다.
        - \`BAD_REQUEST\`: 수정이 불가능한 상태입니다.

        `
    })
    @UseGuards(JwtGuard)
    async updateInquire(
        @Args("id", { type: () => ID }) id: string,
        @Args("data") data: InquireUpdateInput,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ) {
        const inquire = await this.inquireService.findOne(id, ["author"]);
        if (inquire === null) {
            throw new NotFoundGraphQLError("존재하지 않는 문의입니다.");
        } else if (inquire.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError("존재하지 않는 문의입니다.");
        } else if (inquire.state !== InquireState.ACTIVE) {
            throw new BadRequestGraphQLError("수정이 불가능한 상태입니다.");
        }
        return (await this.inquireService.updateOne(inquire.id, data)) as Inquire;
    }

    @Mutation(returns => Inquire, {
        description: dedent`
        문의 삭제하기

        **에러 코드**
        - \`NOT_FOUND\`: 존재하지 않는 문의입니다.
        - \`BAD_REQUEST\`: 삭제가 불가능한 상태입니다.

        `
    })
    @UseGuards(JwtGuard)
    async deleteInquire(
        @Args("id", { type: () => ID }) id: string,
        @CurrentJwtPayload() jwtPayload: AuthTokenPayload
    ) {
        const inquire = await this.inquireService.findOne(id, ["author"]);
        if (inquire === null) {
            throw new NotFoundGraphQLError("존재하지 않는 문의입니다.");
        } else if (inquire.author.id !== jwtPayload.id) {
            throw new NotFoundGraphQLError("존재하지 않는 문의입니다.");
        } else if (inquire.state !== InquireState.ACTIVE) {
            throw new BadRequestGraphQLError("삭제가 불가능한 상태입니다.");
        }
        return (await this.inquireService.deleteOne(inquire.id)) as Inquire;
    }

    @Mutation(returns => Inquire, {
        description: dedent`
        문의 수정하기 - 관리자용

        **에러 코드**
        - \`NOT_FOUND\`: 존재하지 않는 문의입니다.

        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async updateInquireForAdmin(
        @Args("id", { type: () => ID }) id: string,
        @Args("data") data: InquireUpdateInputForAdmin,
    ) {
        const inquire = await this.inquireService.findOne(id);
        if (inquire === null) {
            throw new NotFoundGraphQLError("존재하지 않는 문의입니다.");
        }
        return (await this.inquireService.updateOne(inquire.id, data)) as Inquire;
    }

    @Mutation(returns => Inquire, {
        description: dedent`
        문의 답변하기 - 관리자용

        **에러 코드**
        - \`NOT_FOUND\`: 존재하지 않는 문의입니다.
        - \`BAD_REQUEST\` : 이미 답변한 문의입니다.

        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async answerInquireForAdmin(
        @Args("id", { type: () => ID }) id: string,
        @Args("answerContent", { description: "답변 내용" }) answerContent: string,
        @Args("isPush", { description: "문의자에게 푸시 전송 여부", defaultValue: false }) isPush: boolean
    ) {
        const inquire = await this.inquireService.findOne(id, ["author"]);
        if (inquire === null) {
            throw new NotFoundGraphQLError("존재하지 않는 문의입니다.");
        } else if (inquire.state === InquireState.ANSWERED) {
            throw new BadRequestGraphQLError("이미 답변한 문의입니다.")
        }
        const updatedInquire = (await this.inquireService.updateOne(inquire.id, { state: InquireState.ANSWERED, answerContent: answerContent, answereddAt: new Date() })) as Inquire;
        if (isPush === true) {
            await this.notificationService.send({
                title: `문의답변완료`,
                message: `문의하신 [${inquire.title.slice(0, 7)}...]에 답변이 달렸습니다.`,
                isCreatedForAdmin: true,
                recipients: [{ id: inquire.author.id }],
                type: NotificationType.INQUIRE,
                relationId: inquire.id
            })
        }
        return updatedInquire;
    }

    @Mutation(returns => Inquire, {
        description: dedent`
        문의 상태변경하기 - 관리자용

        **에러 코드**
        - \`NOT_FOUND\`: 존재하지 않는 문의입니다.
        - \`BAD_REQUEST\` : 이미 답변한 문의입니다.

        `
    })
    @UseGuards(JwtGuard, UserRoleGuard)
    @Roles(UserRole.ADMIN)
    async changeInquireStateForAdmin(
        @Args("id", { type: () => ID }) id: string,
        @Args("state", { type: () => InquireState, description: "변경할 상태" }) state: InquireState,
        @Args("isPush", { type: () => Boolean, description: "문의자에게 푸시 전송 여부", defaultValue: false }) isPush: boolean
    ) {
        const inquire = await this.inquireService.findOne(id, ["author"]);
        if (inquire === null) {
            throw new NotFoundGraphQLError("존재하지 않는 문의입니다.");
        } else if (inquire.state === InquireState.ANSWERED) {
            throw new BadRequestGraphQLError("이미 답변한 문의입니다.")
        }
        const updatedInquire = (await this.inquireService.updateOne(inquire.id, { state: state, answereddAt: state === InquireState.ANSWERED ? new Date() : null })) as Inquire;
        if (isPush === true) {
            function transNotiTitle(state: InquireState) {
                let txt = "";
                switch (state) {
                    case InquireState.ACTIVE:
                        txt = "문의상태변경"
                        break;
                    case InquireState.CHECKING:
                        txt = "문의상태변경"
                        break;
                    case InquireState.ANSWERED:
                        txt = "문의답변완료"
                        break;
                    default:
                        txt = "문의상태변경"
                        break;
                }
                return txt;
            }
            function transNotiMessage(state: InquireState) {
                let txt = `문의하신 [${inquire.title.slice(0, 7)}...]`;
                switch (state) {
                    case InquireState.ACTIVE:
                        txt = "이 답변 대기중으로 변경됬습니다."
                        break;
                    case InquireState.CHECKING:
                        txt += "이 확인중으로 변경됬습니다."
                        break;
                    case InquireState.CHECKING:
                        txt += `에 답변이 달렸습니다.`
                        break;
                    default:
                        txt = "의 상태가 변경됬습니다."
                        break;
                }
                return txt;
            }
            await this.notificationService.send({
                title: transNotiTitle(state),
                message: transNotiMessage(state),
                isCreatedForAdmin: true,
                recipients: [{ id: inquire.author.id }],
                type: NotificationType.INQUIRE,
                relationId: inquire.id
            })
        }
        return updatedInquire;
    }

    @ResolveField(returns => User, { description: "문의 작성자" })
    async author(@Parent() inquire: InquireEntity): Promise<User> {
        return this.inquireLoder.getAuthor(inquire.id);
    }

    @ResolveField(returns => [GraphQLFile], { description: "문의 파일", nullable: true })
    async files(@Parent() inquire: InquireEntity): Promise<GraphQLFile[]> {
        return this.inquireLoder.getFiles(inquire.id) as Promise<GraphQLFile[]>;
    }

    @ResolveField(_ => String, { description: "관리자용 유저 메모", nullable: true })
    @UseGuards(OpenGuard)
    async adminMemo(@Parent() inquire: InquireEntity, @CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
        if (jwtPayload == null) return null;
        const info = await this.userLoader.getInfo(jwtPayload.id);
        if (info === undefined || info === null) {
            return null;
        } else if (info.role === UserRole.ADMIN) {
            return inquire.adminMemo
        } else {
            return null;
        }
    }
}
