import { Type } from "@fastify/type-provider-typebox";
import { PSServer } from "../../types.js";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../../repository/repo.user.js";

export function loginEmailHandler(s: PSServer, repo: UserRepository) {
	s.post(
		"/v1/login/email",
		{
			schema: {
				body: Type.Object({
					email: Type.String({
						format: "email",
					}),
					password: Type.String({
						minLength: 8,
						maxLength: 32,
					}),
				}),
			},
		},
		async (req, res) => {
			const { email, password } = req.body;
			const user = await repo.getByEmail(email);
			if (user == null) {
				res.status(StatusCodes.NOT_FOUND);
				return;
			}
			if (user.password != password) {
				res.status(StatusCodes.BAD_REQUEST);
			}
			res.status(StatusCodes.OK).send({
				email: user.email,
				phone: user.phone,
				token: btoa(user._id),
			});
		},
	);
}
