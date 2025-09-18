import type { PSServer } from "../types.js";
import { registerEmailHandler } from "./authentication/register_email.handler.js";
import { UserRepository } from "../repository/repo.user.js";
import { userCollection } from "../provider/provider.db.js";
import { registerPhoneHandler } from "./authentication/register_phone.handler.js";
import { loginEmailHandler } from "./authentication/login_email.handler.js";
import { loginPhoneHandler } from "./authentication/login_phone.handler.js";
import { StatusCodes } from "http-status-codes";
import { User } from "../entity/user.entity.js";
import { profilePostPhoneHandler, profileGetterHandler, profilePostEmailHandler, profilePutHandler } from "./profile/profile_getter.handler.js";

declare module "fastify" {
	interface FastifyRequest {
		user: User;
	}
}

export function registerRoutes(s: PSServer) {
	const repo = new UserRepository(userCollection);
	s.register((ins, _) => {
		registerEmailHandler(ins, repo);
		registerPhoneHandler(ins, repo);
		loginEmailHandler(ins, repo);
		loginPhoneHandler(ins, repo);
	});

	s.register((ins, _) => {
		ins.addHook("preHandler", async (req, res) => {
			const token = req.headers.authorization;
			// token is string | undefined
			if (!token) {
				res.status(StatusCodes.UNAUTHORIZED).send();
				return;
			}
			const userId = atob(token);
			console.error("token", token);
			console.error("userId", userId);
			const user = await repo.get(userId);
			console.error("user", user);
			if (!user) {
				res.status(StatusCodes.UNAUTHORIZED).send();
				return;
			}

			req.user = user;
		});

		profileGetterHandler(ins);
		profilePutHandler(ins, repo);
		profilePostEmailHandler(ins, repo);
		profilePostPhoneHandler(ins, repo);

	});
}
