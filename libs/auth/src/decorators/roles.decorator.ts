/**
 * @module UserModule
 */
import { CustomDecorator, SetMetadata } from "@nestjs/common";
import { USER_ROLE_METADATA } from "../guards/role.const";

/**
 * 사용자의 권한별로 접근 가능/불가능하게 만들기 위한 데코레이터
 * @category Decorator
 * @param roles 권한(타입)
 * @example
 * ```typescript
 * @Query(returns => User)
 * @UseGuards(JwtGuard, UserRoleGuard)
 * @Roles(UserRole.ADMIN)
 * async update(@Args("id", {type: () => ID}) id: string, @Args("data") data: UpdateUserInput) {
 *  // ..
 * }
 * ```
 */
export const Roles = (...roles: string[]): CustomDecorator<string> => SetMetadata(USER_ROLE_METADATA, roles);
