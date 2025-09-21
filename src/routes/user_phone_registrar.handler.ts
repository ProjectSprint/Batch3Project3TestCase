import { Type } from "@fastify/type-provider-typebox";
import { PSServer } from "../types.js";
import { StatusCodes } from "http-status-codes";
import { UserRepository } from "../repository/repo.user.js";
import { callingCodes } from "../const/calling_code.const.js";

const pattern = "^\\+(" + callingCodes.join("|") + ")\\d*$";
export function userPhoneRegistrar(s: PSServer, repo: UserRepository) {
	s.post(
		"/v1/register/phone",
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
			const user = await repo.insertByPhone(phone, password);
			if (user == null) {
				res.status(StatusCodes.CONFLICT);
				return;
			}
			res.status(StatusCodes.CREATED).send({
				email: user.email,
				phone: user.phone,
				token: btoa(user._id),
			});
		},
	);
}
