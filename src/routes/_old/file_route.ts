import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { Server } from "./types.js";
import { FileMetadata, FileDTO } from "./model.file.ts";
import { fileRepository } from "./repo.file.ts";
import { hashPassword, generateToken, comparePassword } from "./helper.auth.ts";
import { randomUUID } from "node:crypto";
import { enumRoutes } from "./enum.routes.js";

export function postFileHandler(s: Server) {
	s.post(enumRoutes.FILE, async (req, res) => {
		const data = await req.file();

		if (!data) {
			return res
				.status(StatusCodes.BAD_REQUEST)
				.send({ error: "No file uploaded" });
		}

		// bikin metadata object
		const metadata = new FileMetadata({
			originalName: data.filename,
			mimeType: data.mimetype,
			size: data.file.bytesRead,
		});

		// validasi metadata
		const errors = metadata.validate();
		if (errors.length > 0) {
			return res.status(StatusCodes.BAD_REQUEST).send({ errors });
		}

		// TODO: simpan ke repository
		try {
			if ((await fileRepository.get(metadata)) != null) {
				res.status(StatusCodes.CONFLICT).send({ error: "file masih ada" });
				return;
			}
			await fileRepository.insert(metadata);
		} catch (error) {
			res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error });
			return;
		}

		// await fileRepository.insert(metadata);

		return res.status(StatusCodes.CREATED).send({
			fileId: metadata.fileId,
			fileUri: metadata.fileUri,
			fileThumbnailUri: metadata.fileThumbnailUri,
		});
	});
}
