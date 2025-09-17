import { Type } from "@fastify/type-provider-typebox";
import { PSServer } from "../../types.js";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../../repository/repo.user.js";
import { callingCodes } from "../../const/calling_code.const.js";

export function loginPhoneHandler(s: PSServer, repo: UserRepository) {
	const pattern = "^\\+(" + callingCodes.join("|") + ")\\d*$";
	s.post(
		"/v1/login/phone",
		{
			schema: {
				body: Type.Object({
					phone: Type.String({
						pattern,
					}),
					password: Type.String({
						minLength: 8,
						maxLength: 32,
					}),
				}),
			},
		},
		async (req, res) => {
			const { phone, password } = req.body;
			const user = await repo.getByPhone(phone);
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
