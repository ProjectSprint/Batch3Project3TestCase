import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import {
	FastifyBaseLogger,
	FastifyInstance,
	RawReplyDefaultExpression,
	RawRequestDefaultExpression,
	RawServerDefault,
} from "fastify";
import { User } from "./entity/user.entity.js";

declare module "fastify" {
	interface FastifyRequest {
		user: User;
	}
}

export type PSServer = FastifyInstance<
	RawServerDefault,
	RawRequestDefaultExpression<RawServerDefault>,
	RawReplyDefaultExpression<RawServerDefault>,
	FastifyBaseLogger,
	TypeBoxTypeProvider
>;
