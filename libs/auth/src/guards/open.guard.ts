/**
 * @module AuthModule
 */
import { FastifyRequest } from "fastify";
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { GqlContextType, GqlExecutionContext } from "@nestjs/graphql";
import { JwtService } from "@nestjs/jwt";
import { AuthTokenService } from "../token/token.service";
import { Request, SubscriptionConnectionParams } from "./request.type";
import { AuthTokenPayload } from "../token/payload.interface";

/**
 * JWT 토큰 디코딩용 가드
 * @description JWT 토큰이 유효하지 않아도 토큰을 디코딩하여 CurrentJwtPayload 데코레이터를 사용할 수 있습니다.
 * @category Guard
 */
@Injectable()
export class OpenGuard implements CanActivate {
  /**
   * @param jwtService JWT 서비스
   * @param authTokenService  인증 토큰 서비스
   */
  constructor(public jwtService: JwtService, public authTokenService: AuthTokenService) {}

  /**
   * 현재 컨텍스트에서 클라이언트 요청(Request) 데이터 가져옵니다.
   * @param contextType 컨텍스트 타입 (http, graphql, ...)
   * @param context NestJS 실행 컨텍스트
   * @returns 클라이언트 요청(Request) 데이터
   */
  getRequest(contextType: GqlContextType, context: ExecutionContext): Request {
    switch (contextType) {
      case "http": {
        return context.switchToHttp().getRequest<FastifyRequest>();
      }
      case "graphql": {
        const info = GqlExecutionContext.create(context).getInfo();
        if (info.operation.kind === "OperationDefinition" && info.operation.operation === "subscription") {
          return GqlExecutionContext.create(context).getContext().connection as SubscriptionConnectionParams;
        } else {
          return GqlExecutionContext.create(context).getContext().req as FastifyRequest;
        }
      }
      default:
        return null;
    }
  }

  /**
   * 클라이언트 요청(Request) 데이터의 Authorization 헤더에서 디코딩되지 않은 토큰을 추출합니다.
   * @param contextType 컨텍스트 타입 (http, graphql,...)
   * @param request 클라이언트 요청(Request) 데이터
   * @returns 토큰
   */
  extractToken(contextType: GqlContextType, request: Request): string | null {
    let authorization: string;
    switch (contextType) {
      case "http":
        authorization = (request as FastifyRequest).headers.authorization;
        break;
      case "graphql":
        if ("authorization" in request) {
          authorization = request.authorization;
        } else {
          authorization = (request as FastifyRequest).headers.authorization;
        }
        break;
      default:
        return null;
    }
    if (authorization == null) return null;

    const [type, token] = authorization.split(" ");
    if (type.toLowerCase() !== "bearer") return null;
    if (token == null) return null;

    return token;
  }

  /**
   * 토큰을 분석하여 유효성 검사합니다.
   * @param request 클라이언트 요청(Request) 데이터
   * @param token 디코딩되지 않은 토큰
   * @returns 유효성 검사 통과 여부
   */
  async validate(request: Request, token?: string): Promise<boolean> {
    if (token == null) return true;
    if ((await this.authTokenService.validate(token)) === true) {
      request.jwtPayload = this.jwtService.decode(token) as AuthTokenPayload;
    }

    return true;
  }

  /**
   * @see {@link https://docs.nestjs.com/guards#execution-context}
   * @param context NestJS 실행 컨텍스트
   * @returns 결과
   */
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const contextType = context.getType<GqlContextType>();
    const request = this.getRequest(contextType, context);
    const token = this.extractToken(contextType, request);
    return await this.validate(request, token);
  }
}
