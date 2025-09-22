import type { PSServer } from "../types.js";
import { UserRepository } from "../repository/repo.user.js";
import {
	fileCollection,
	productCollection,
	purchaseCollection,
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
import { ProductRepository } from "../repository/repo.product.js";
import { productCreatorHandler } from "./product_creator.handler.js";
import { productGetterHandler } from "./product_getter.handler.js";
import { productUpdaterHandler } from "./product_updater.handler.js";
import { productDeleterHandler } from "./product_deleter.handler.js";
import { purchaseHandlers } from "./purchase_creator.handler.js";
import { PurchaseRepository } from "../repository/repo.purchase.js";

declare module "fastify" {
	interface FastifyRequest {
		user: User;
	}
}

export function registerRoutes(s: PSServer) {
	const userRepo = new UserRepository(userCollection);
	const fileRepo = new FileRepository(fileCollection);
	const productRepo = new ProductRepository(productCollection);
	const purchaseRepo = new PurchaseRepository(purchaseCollection);
	s.register((ins, _) => {
		userEmailRegistrar(ins, userRepo);
		userPhoneRegistrar(ins, userRepo);
		userEmailAutheticator(ins, userRepo);
		userPhoneAuthenticator(ins, userRepo);
		productGetterHandler(ins, productRepo);
		fileCreator(ins, fileRepo);
		purchaseHandlers(ins, purchaseRepo, productRepo, userRepo, fileRepo);
	});

	s.register((ins, _) => {
		ins.addHook("onRequest", async (req, res) => {
			let token = req.headers.authorization;
			// token is string | undefined
			if (!token && !token?.startsWith("Bearer")) {
				res.status(StatusCodes.UNAUTHORIZED).send();
				return;
			}
			token = token.substring(7, token.length);
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
		productCreatorHandler(ins, productRepo, fileRepo);
		productUpdaterHandler(ins, productRepo, fileRepo);
		productDeleterHandler(ins, productRepo);
	});
}
