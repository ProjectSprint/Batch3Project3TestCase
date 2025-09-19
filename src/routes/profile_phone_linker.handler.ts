import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { UserRepository } from "../repository/repo.user.js";
import { callingCodes } from "../const/calling_code.const.js";

export function profilePhoneLinkerHandler(s: PSServer, repo: UserRepository) {
	const pattern = "^\\+(" + callingCodes.join("|") + ")\\d*$";
	s.post(
		"/v1/user/link/phone",
		{
			schema: {
				body: Type.Object({
					phone: Type.String({
						pattern,
					}),
				}),
			},
		},
		async (req, res) => {
			const usr = req.user;
			const { phone } = req.body;
			const user = await repo.updatePhone(usr, phone);
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
