import type { PSServer } from "../types.js";
import { registerEmailHandler } from "./authentication/register_email.handler.js";
import { UserRepository } from "../repository/repo.user.js";
import { userCollection } from "../provider/provider.db.js";
import { registerPhoneHandler } from "./authentication/register_phone.handler.js";
import { loginEmailHandler } from "./authentication/login_email.handler.js";
import { loginPhoneHandler } from "./authentication/login_phone.handler.js";
import { StatusCodes } from "http-status-codes";

export function registerRoutes(s: PSServer) {
	const repo = new UserRepository(userCollection);
	s.register((ins, _, done) => {
		registerEmailHandler(ins, repo);
		registerPhoneHandler(ins, repo);
		loginEmailHandler(ins, repo);
		loginPhoneHandler(ins, repo);
		done();
	});

	s.register((ins, _, done) => {
		ins.addHook("preHandler", async (req, res) => {
			const token = req.headers.authorization;
			// token is string | undefined
			if (!token) {
				res.send(StatusCodes.UNAUTHORIZED);
				return;
			}
			const userId = atob(token);
			const user = await repo.get(userId);
			if (!user) {
				res.send(StatusCodes.UNAUTHORIZED);
				return;
			}
		});
		done();

		// add route here
	});
}
