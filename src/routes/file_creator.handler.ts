import { StatusCodes } from "http-status-codes";
import { PSServer } from "../types.js";
import { FileRepository } from "../repository/repo.file.js";
import { randomUUID } from "crypto";

const ALLOWED_MIME = ["image/jpeg", "image/jpg", "image/png"];
const MAX_SIZE = 100 * 1024; // 100 KiB
export function fileCreator(s: PSServer, repo: FileRepository) {
	s.post("/v1/file", {}, async (req, res) => {
		const data = await req.file(); // from fastify-multipart
		if (!data) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.send({ error: "File is required" });
		}

		// Validate mimetype
		if (!ALLOWED_MIME.includes(data.mimetype)) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.send({ error: "Only jpeg, jpg, and png files are allowed" });
		}

		// Validate size (stream.length isn’t available, so we accumulate)
		let size = 0;
		for await (const chunk of data.file) {
			size += chunk.length;
			if (size > MAX_SIZE) {
				return res
					.status(StatusCodes.BAD_REQUEST)
					.send({ error: "File must be smaller than 100 KiB" });
			}
		}
		const id = randomUUID();
		const result = {
			_id: id,
			fileId: id,
			fileThumbnailUri:
				"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HelloWorld.svg/2560px-HelloWorld.svg.png",
			fileUri:
				"https://upload.wikimedia.org/wikipedia/commons/thumb/2/28/HelloWorld.svg/2560px-HelloWorld.svg.png",
		};
		repo.insert(result);
		return res.status(StatusCodes.OK).send(result);
	});
}
