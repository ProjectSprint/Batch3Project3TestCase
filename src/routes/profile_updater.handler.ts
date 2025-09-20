import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { UserRepository } from "../repository/repo.user.js";
import { FileRepository } from "../repository/repo.file.js";

export function profileUpdaterHandler(
	s: PSServer,
	usrRepo: UserRepository,
	fileRepo: FileRepository,
) {
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
			if (
				bankAccountName == "true" ||
				bankAccountHolder == "true" ||
				bankAccountNumber == "true"
			) {
				console.log("true value passed the validation!");
			}
			const fileRes = await fileRepo.get(fileId);
			if (!fileRes) {
				return res.status(StatusCodes.BAD_REQUEST).send();
			}

			const user = await usrRepo.updateProfile(
				usr._id,
				fileRes,
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
