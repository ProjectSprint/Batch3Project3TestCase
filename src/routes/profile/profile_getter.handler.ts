import { Type } from "@fastify/type-provider-typebox";
import { callingCodes } from "../../const/calling_code.const.js";
import { UserRepository } from "../../repository/repo.user.js";
import { PSServer } from "../../types.js";
import { StatusCodes } from "http-status-codes";

export function profileGetterHandler(s: PSServer) {
	s.get("/v1/user", {}, async (req, res) => {
		const usr = req.user;
		res.status(StatusCodes.OK).send({
			...usr,
		});
	});
}

export function profilePutHandler(s: PSServer, repo: UserRepository) {
	s.put(
		"/v1/user",
		{
			schema: {
				body: Type.Object({
					fileId: Type.String({}),
					bankAccountName: Type.String({
						minLength: 4,
						maxLength: 32,
					}),
					bankAccountHolder: Type.String({
						minLength: 4,
						maxLength: 32,
					}),
					bankAccountNumber: Type.String({
						minLength: 4,
						maxLength: 32,
					}),
				}),
			},
		},
		async (req, res) => {
			const usr = req.user;
			const { fileId, bankAccountName, bankAccountHolder, bankAccountNumber } =
				req.body;
			const user = await repo.updateProfile(
				usr._id,
				fileId,
				bankAccountName,
				bankAccountHolder,
				bankAccountNumber,
			);
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

export function profilePostPhoneHandler(s: PSServer, repo: UserRepository) {
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
			const user = await repo.updatePhone(usr._id, phone);
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

export function profilePostEmailHandler(s: PSServer, repo: UserRepository) {
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
			const user = await repo.updateEmail(usr._id, email);
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
