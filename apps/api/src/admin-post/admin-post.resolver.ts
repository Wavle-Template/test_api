/**
 * @module AdminPostModule
 */
import { UseGuards } from "@nestjs/common";
import { Args, ID, Info, Mutation, Parent, Query, ResolveField, Resolver } from "@nestjs/graphql";
import { IPagination, NotFoundGraphQLError } from "@yumis-coconudge/common-module";
import graphqlFields from "graphql-fields";
import { GraphQLResolveInfo } from "graphql";
import { UserRole } from "@app/entity";
import { AdminPostService } from "./admin-post.service";
import { AdminPost, AdminPostList, Faq, Notice } from "./admin-post.model";
import dedent from "dedent";
import { BannerCreateInput, BannerUpdateInput, EventCreateInput, EventUpdateInput, FaqCreateInput, FaqUpdateInput, NoticeCreateInput, NoticeUpdateInput, PopupCreateInput, PopupUpdateInput } from "./admin-post.input";
import { AdminPostEntity } from "./admin-post.entity";
import { AdminPostLoader } from "./admin-post.loader";
import { AdminPostCategory } from "./category/category.model";
import { AdminPostListArgs } from "./admin-post.args";
import { ApolloError } from "apollo-server-fastify";
import { AdminPostType } from "./admin-post.enum";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";
import { UserRoleGuard } from "@app/auth/guards/role.guard";

/**
 * 관리자가 작성한 게시물 리졸버
 * @description GraphQL 문서를 확인하세요.
 */
@Resolver(of => AdminPost)
export class AdminPostResolver {
  constructor(public adminPostService: AdminPostService, public adminPostLoader: AdminPostLoader) { }

  @Query(returns => AdminPost, {
    description: dedent`
      관리자가 작성한 게시물을 조회합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
    `,
  })
  async adminPost(@Args("id", { type: () => ID, description: "게시물 ID" }) id: string): Promise<AdminPost> {
    const post = await this.adminPostService.findOne(id);
    if (post == null) throw new NotFoundGraphQLError("해당 게시물을 찾을 수 없습니다.");

    return {
      ...post,
      question: post.title,
      answer: post.content,
    } as AdminPost;
  }

  @Query(returns => AdminPostList, {
    description: dedent`
      관리자가 작성한 게시물 목록을 가져옵니다.

      [GraphQL Cursor Connections Specification](https://relay.dev/graphql/connections.htm)
    `,
  })
  @UseGuards(JwtGuard)
  async adminPosts(@Args() args: AdminPostListArgs, @Info() info: GraphQLResolveInfo): Promise<AdminPostList> {
    const fields = graphqlFields(info);
    let result: Partial<IPagination<AdminPostEntity>> = {
      totalCount: null,
      edges: null,
      pageInfo: null,
    };

    try {
      if ("totalCount" in fields) result.totalCount = await this.adminPostService.countByFilterArgs(args);

      if ("edges" in fields || "pageInfo" in fields) result.edges = await this.adminPostService.getEdges(args);

      if ("edges" in fields && "pageInfo" in fields)
        result.pageInfo = await this.adminPostService.getPageInfo(result.edges, args);

      return result as AdminPostList;
    } catch (e) {
      if (e instanceof SyntaxError) throw new ApolloError("잘못된 인자입니다.");
      throw e;
    }
  }

  // @Mutation(returns => [Faq], { description: "엑셀 파일로부터 FAQ 생성" })
  // @UseGuards(JwtGuard)
  // @Roles(UserRole.ADMIN)
  // async createFaqFromFile(@Args("fileId", { type: () => ID, description: "파일 ID" }) fileId: string): Promise<Faq[]> {
  //   try {
  //     return await this.#FaqService.createFromFile(fileId);
  //   } catch (e) {
  //     if (e instanceof Error) {
  //       if (e.message === "NOT FOUND") throw new NotFoundGraphQLError("존재하지 않는 파일입니다.");
  //       else if (e.message === "NOT SUPPORTED") throw new BadRequestGraphQLError("지원하지 않는 파일입니다.");
  //       else if (e.message === "INVALID COLUMN") throw new BadRequestGraphQLError("양식이 잘못된 파일입니다.");
  //       else if (e.message === "NO ROWS") throw new BadRequestGraphQLError("내용이 존재하지 않습니다.");
  //     }
  //     throw e;
  //   }
  // }

  @Mutation(returns => Notice, {
    description: dedent`
      공지사항을 생성합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async createNoticeForAdmin(
    @Args("data", { description: "생성 데이터" }) { categoryId, ...data }: NoticeCreateInput,
  ): Promise<Notice> {
    let post: AdminPostEntity;
    const inputData = { ...data, state: AdminPostType.NOTICE }
    if (categoryId != null) post = await this.adminPostService.createOne({ ...inputData, category: { id: categoryId } });
    else post = await this.adminPostService.createOne(inputData);

    return post as Notice;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      공지사항을 수정합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async updateNoticeForAdmin(
    @Args("id", { type: () => ID, description: "게시물 ID" }) id: string,
    @Args("data", { description: "수정할 데이터" }) { categoryId, ...data }: NoticeUpdateInput,
  ): Promise<Notice> {
    let post: AdminPostEntity;
    if (categoryId != null) post = await this.adminPostService.updateOne(id, { ...data, category: { id: categoryId } });
    else post = await this.adminPostService.updateOne(id, data);

    return post as Notice;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      공지사항을 삭제합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteNoticeForAdmin(@Args("id", { type: () => ID, description: "게시물 ID" }) id: string): Promise<Notice> {
    return this.adminPostService.softDeleteOne(id) as Promise<Notice>;
  }

  @Mutation(returns => Faq, {
    description: dedent`
      자주 묻는 질문을 생성합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async createFaqForAdmin(
    @Args("data", { description: "생성 데이터" }) { categoryId, ...data }: FaqCreateInput,
  ): Promise<Faq> {
    let post: AdminPostEntity;
    const inputData = { ...data, state: AdminPostType.FAQ }
    if (categoryId != null) post = await this.adminPostService.createOne({ ...inputData, category: { id: categoryId } });
    else post = await this.adminPostService.createOne(inputData);

    return {
      ...post,
      question: post.title,
      answer: post.content,
    } as Faq;
  }

  @Mutation(returns => Faq, {
    description: dedent`
      자주 묻는 질문을 수정합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async updateFaqForAdmin(
    @Args("id", { type: () => ID, description: "게시물 ID" }) id: string,
    @Args("data", { description: "수정할 데이터" }) { categoryId, ...data }: FaqUpdateInput,
  ): Promise<Faq> {
    let post: AdminPostEntity;
    if (categoryId != null) post = await this.adminPostService.updateOne(id, { ...data, category: { id: categoryId } });
    else post = await this.adminPostService.updateOne(id, data);

    return {
      ...post,
      question: post.title,
      answer: post.content,
    } as Faq;
  }

  @Mutation(returns => Faq, {
    description: dedent`
      자주 묻는 질문을 삭제합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteFaqForAdmin(@Args("id", { type: () => ID, description: "게시물 ID" }) id: string): Promise<Faq> {
    const post = await this.adminPostService.softDeleteOne(id);

    return {
      ...post,
      question: post.title,
      answer: post.content,
    } as Faq;
  }

  @Mutation(returns => [Faq], {
    description: dedent`
      자주 묻는 질문을 여러 개 삭제합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteFaqsForAdmin(
    @Args("ids", { type: () => [ID], description: "게시물 ID 목록" }) ids: string[],
  ): Promise<Faq[]> {
    const posts = await this.adminPostService.softDeleteMany(ids);

    return posts.map(
      post =>
      ({
        ...post,
        question: post.title,
        answer: post.content,
      } as Faq),
    );
  }


  @Mutation(returns => Notice, {
    description: dedent`
      배너를 생성합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async createBannerForAdmin(
    @Args("data", { description: "생성 데이터" }) { categoryId, ...data }: BannerCreateInput,
  ): Promise<Notice> {
    let post: AdminPostEntity;
    const inputData = { ...data, state: AdminPostType.BANNER }
    if (categoryId != null) post = await this.adminPostService.createOne({ ...inputData, category: { id: categoryId } });
    else post = await this.adminPostService.createOne(inputData);

    return post as Notice;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      배너를 수정합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async updateBannerForAdmin(
    @Args("id", { type: () => ID, description: "게시물 ID" }) id: string,
    @Args("data", { description: "수정할 데이터" }) { categoryId, ...data }: BannerUpdateInput,
  ): Promise<Notice> {
    let post: AdminPostEntity;
    if (categoryId != null) post = await this.adminPostService.updateOne(id, { ...data, category: { id: categoryId } });
    else post = await this.adminPostService.updateOne(id, data);

    return post as Notice;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      배너를 삭제합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteBannerForAdmin(@Args("id", { type: () => ID, description: "게시물 ID" }) id: string): Promise<Notice> {
    return this.adminPostService.softDeleteOne(id) as Promise<Notice>;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      팝업을 생성합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async createPopupForAdmin(
    @Args("data", { description: "생성 데이터" }) { categoryId, ...data }: PopupCreateInput,
  ): Promise<Notice> {
    let post: AdminPostEntity;
    const inputData = { ...data, state: AdminPostType.POPUP }
    if (categoryId != null) post = await this.adminPostService.createOne({ ...inputData, category: { id: categoryId } });
    else post = await this.adminPostService.createOne(inputData);

    return post as Notice;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      팝업을 수정합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async updatePopupForAdmin(
    @Args("id", { type: () => ID, description: "게시물 ID" }) id: string,
    @Args("data", { description: "수정할 데이터" }) { categoryId, ...data }: PopupUpdateInput,
  ): Promise<Notice> {
    let post: AdminPostEntity;
    if (categoryId != null) post = await this.adminPostService.updateOne(id, { ...data, category: { id: categoryId } });
    else post = await this.adminPostService.updateOne(id, data);

    return post as Notice;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      팝업을 삭제합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deletePopupForAdmin(@Args("id", { type: () => ID, description: "게시물 ID" }) id: string): Promise<Notice> {
    return this.adminPostService.softDeleteOne(id) as Promise<Notice>;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      이벤트를 생성합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async createEventForAdmin(
    @Args("data", { description: "생성 데이터" }) { categoryId, ...data }: EventCreateInput,
  ): Promise<Notice> {
    let post: AdminPostEntity;
    const inputData = { ...data, state: AdminPostType.EVENT }
    if (categoryId != null) post = await this.adminPostService.createOne({ ...inputData, category: { id: categoryId } });
    else post = await this.adminPostService.createOne(inputData);

    return post as Notice;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      이벤트를 수정합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async updateEventForAdmin(
    @Args("id", { type: () => ID, description: "게시물 ID" }) id: string,
    @Args("data", { description: "수정할 데이터" }) { categoryId, ...data }: EventUpdateInput,
  ): Promise<Notice> {
    let post: AdminPostEntity;
    if (categoryId != null) post = await this.adminPostService.updateOne(id, { ...data, category: { id: categoryId } });
    else post = await this.adminPostService.updateOne(id, data);

    return post as Notice;
  }

  @Mutation(returns => Notice, {
    description: dedent`
      이벤트를 삭제합니다. 관리자만 허용합니다.

      **에러 코드**
      - \`NOT_FOUND\`: 해당 게시물을 찾을 수 없습니다.
      - \`FORBIDDEN\`: 권한이 없습니다.
    `,
  })
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteEventForAdmin(@Args("id", { type: () => ID, description: "게시물 ID" }) id: string): Promise<Notice> {
    return this.adminPostService.softDeleteOne(id) as Promise<Notice>;
  }


  @ResolveField(type => AdminPostCategory, { nullable: true, description: "카테고리" })
  async category(@Parent() adminPost: AdminPostEntity): Promise<AdminPostCategory> {
    return this.adminPostLoader.getCategory(adminPost.id);
  }
}
