import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";

export function profileReaderHandler(s: PSServer) {
	s.get("/v1/user", {}, async (req, res) => {
		const usr = req.user;
		res.status(StatusCodes.OK).send({
			...usr,
		});
	});
}
