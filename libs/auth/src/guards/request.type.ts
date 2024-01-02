/**
 * @module AuthModule
 * @hidden
 */
import type { FastifyRequest } from "fastify";
import type { AuthTokenPayload } from "../token/payload.interface";

export type SubscriptionConnectionParams = { authorization?: string };
export type Request = (FastifyRequest | SubscriptionConnectionParams) & { jwtPayload?: AuthTokenPayload };
