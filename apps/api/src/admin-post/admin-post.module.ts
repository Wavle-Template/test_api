/**
 * @module AdminPostModule
 */
import { AuthModule } from "@app/auth";
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { UserModule } from "../user/user.module";
import { AdminPostEntity } from "./admin-post.entity";
import { AdminPostLoader } from "./admin-post.loader";
import { AdminPostResolver } from "./admin-post.resolver";
import { AdminPostService } from "./admin-post.service";
import { AdminPostCategoryEntity } from "./category/category.entity";
import { AdminPostCategoryResolver } from "./category/category.resolver";
import { AdminPostCategoryService } from "./category/category.service";

/**
 * 관리자 게시물 모듈
 * @hidden
 */
@Module({
  imports: [AuthModule, UserModule, TypeOrmModule.forFeature([AdminPostEntity, AdminPostCategoryEntity])],
  providers: [
    AdminPostService,
    AdminPostCategoryService,
    AdminPostLoader,
    AdminPostResolver,
    AdminPostCategoryResolver,
  ],
  exports: [AdminPostService, AdminPostCategoryService, AdminPostLoader],
})
export class AdminPostModule { }
