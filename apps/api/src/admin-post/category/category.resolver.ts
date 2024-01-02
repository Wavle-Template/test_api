import { UseGuards } from "@nestjs/common";
import { Args, ID, Mutation, Query, Resolver } from "@nestjs/graphql";
import { UserRole } from "@app/entity";
import { AdminPostCategoryCreateInput, AdminPostCategoryUpdateInput } from "./category.input";
import { AdminPostCategory } from "./category.model";
import { AdminPostCategoryService } from "./category.service";
import { JwtGuard } from "@app/auth/guards/jwt.guard";
import { UserRoleGuard } from "@app/auth/guards/role.guard";
import { Roles } from "@app/auth/decorators/roles.decorator";

@Resolver(of => AdminPostCategory)
export class AdminPostCategoryResolver {
  constructor(public adminPostCategoryService: AdminPostCategoryService) {}

  @Query(returns => [AdminPostCategory])
  async adminPostCategories(): Promise<AdminPostCategory[]> {
    return this.adminPostCategoryService.getAll();
  }

  @Mutation(returns => AdminPostCategory)
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async createAdminPostCategory(
    @Args("data", { description: "생성 데이터" }) data: AdminPostCategoryCreateInput,
  ): Promise<AdminPostCategory> {
    return this.adminPostCategoryService.createOne(data);
  }

  @Mutation(returns => AdminPostCategory)
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async updateAdminPostCategory(
    @Args("id", { description: "카테고리 ID", type: () => ID }) id: string,
    @Args("data") data: AdminPostCategoryUpdateInput,
  ): Promise<AdminPostCategory> {
    return this.adminPostCategoryService.updateOne(id, data);
  }

  @Mutation(returns => AdminPostCategory)
  @UseGuards(JwtGuard, UserRoleGuard)
  @Roles(UserRole.ADMIN)
  async deleteAdminPostCategory(
    @Args("id", { description: "카테고리 ID", type: () => ID }) id: string,
  ): Promise<AdminPostCategory> {
    return this.adminPostCategoryService.deleteOne(id);
  }
}
