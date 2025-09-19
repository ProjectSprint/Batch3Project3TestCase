import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { UserRepository } from "../repository/repo.user.js";

export function profileEmailLinkerHandler(s: PSServer, repo: UserRepository) {
	s.post(
		"/v1/user/link/email",
		{
			schema: {
				body: Type.Object({
					email: Type.String({
						format: "email",
					}),
				}),
			},
		},
		async (req, res) => {
			const usr = req.user;
			const { email } = req.body;
			const user = await repo.updateEmail(usr, email);
			if (user == null) {
				res.status(StatusCodes.CONFLICT);
				return;
			}
			res.status(StatusCodes.OK).send({
				...user,
			});
		},
	);
}
