import type { PSServer } from "../types.js";
import { UserRepository } from "../repository/repo.user.js";
import {
	fileCollection,
	productCollection,
	userCollection,
} from "../provider/provider.db.js";
import { StatusCodes } from "http-status-codes";
import { User } from "../entity/user.entity.js";
import { profileReaderHandler } from "./profile_reader.handler.js";
import { profileUpdaterHandler } from "./profile_updater.handler.js";
import { profileEmailLinkerHandler } from "./profile_email_linker.handler.js";
import { profilePhoneLinkerHandler } from "./profile_phone_linker.handler.js";
import { userEmailRegistrar } from "./user_email_registrar.handler.js";
import { userPhoneRegistrar } from "./user_phone_registrar.handler.js";
import { userEmailAutheticator } from "./user_email_authenticator.handler.js";
import { userPhoneAuthenticator } from "./user_phone_authenticator.handler.js";
import { fileCreator } from "./file_creator.handler.js";
import { FileRepository } from "../repository/repo.file.js";
import { productHandlers } from "./product_creator.handler.js";
import { ProductRepository } from "../repository/repo.product.js";

declare module "fastify" {
	interface FastifyRequest {
		user: User;
	}
}

export function registerRoutes(s: PSServer) {
	const userRepo = new UserRepository(userCollection);
	const fileRepo = new FileRepository(fileCollection);
	const productRepo = new ProductRepository(productCollection);
	s.register((ins, _) => {
		userEmailRegistrar(ins, userRepo);
		userPhoneRegistrar(ins, userRepo);
		userEmailAutheticator(ins, userRepo);
		userPhoneAuthenticator(ins, userRepo);
	});

	s.register((ins, _) => {
		ins.addHook("onRequest", async (req, res) => {
			const token = req.headers.authorization;
			// token is string | undefined
			if (!token) {
				res.status(StatusCodes.UNAUTHORIZED).send();
				return;
			}
			const userId = atob(token);
			const user = await userRepo.get(userId);
			if (!user) {
				res.status(StatusCodes.UNAUTHORIZED).send();
				return;
			}
			req.user = user;
		});

		profileReaderHandler(ins);
		profileUpdaterHandler(ins, userRepo, fileRepo);
		profileEmailLinkerHandler(ins, userRepo);
		profilePhoneLinkerHandler(ins, userRepo);
		fileCreator(ins, fileRepo);
		productHandlers(ins, productRepo, fileRepo);
	});
}
