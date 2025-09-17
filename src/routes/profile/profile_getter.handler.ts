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
