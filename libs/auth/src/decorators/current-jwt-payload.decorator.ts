/**
 * @module AuthModule
 */
import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import type { AuthTokenPayload } from "../token/payload.interface";

/**
 * 현재 JWT 토큰 페이로드 인자용 데코레이터
 * @description 현재 JWT 토큰의 페이로드 내용 {@link AuthTokenPayload}을 함수 인자로 가져옵니다.
 * @category Decorator
 * @example
 * ```typescript
 * @Query(returns => User)
 * async me(@CurrentJwtPayload() jwtPayload: AuthTokenPayload) {
 *  // ...
 * }
 * ```
 */
export const CurrentJwtPayload = createParamDecorator<void, ExecutionContext, AuthTokenPayload | null>((_, ctx) => {
  const contextType = ctx.getType<GqlContextType>();
  switch (contextType) {
    case "http":
      return ctx.switchToHttp().getRequest().jwtPayload ?? null;
    case "graphql":
      return GqlExecutionContext.create(ctx).getContext().req.jwtPayload ?? null;
    default:
      return null;
  }
});
