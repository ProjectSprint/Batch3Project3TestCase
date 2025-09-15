import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { Server } from "./types.js";
import { FileMetadata, FileDTO } from "./model.file.ts";
import { userRepository } from "./repo.user.ts";
import { hashPassword, generateToken, comparePassword } from "./helper.auth.ts";
import { randomUUID } from "node:crypto";
import { enumRoutes } from "./enum.routes.js";

export function postFileHandler(s: Server) {
  s.post(
    enumRoutes.FILE,
    async (req, res) => {
      const data = await req.file();

      if (!data) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: "No file uploaded" });
      }

      // bikin metadata object
      console.log(data)
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
      // await fileRepository.insert(metadata);

      return res.status(StatusCodes.CREATED).send({
        message: "File metadata stored successfully",
        file: metadata,
      });
    }
  )
}

