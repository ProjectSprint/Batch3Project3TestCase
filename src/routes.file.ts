import { StatusCodes } from "http-status-codes";
import { Server } from "./types.js";
import { FileMetadata, FileDTO } from "./model.file.ts";
import { fileRepository } from "./repo.file.ts"
import { enumRoutes } from "./enum.routes.js";

export function postFileHandler(s: Server) {
  s.post(
    enumRoutes.FILE,
    async (req, res) => {
      const data = await req.file();

      if (!data) {
        return res.status(StatusCodes.BAD_REQUEST).send({ error: "No file uploaded" });
      }

      // hitung manual dari stream
      let size = 0;
      for await (const chunk of data.file) {
        size += chunk.length;
      }

      const metadata = new FileMetadata({
        originalName: data.filename,
        mimeType: data.mimetype,
        size,
      });

      // validasi metadata
      const errors = metadata.validate();
      if (errors.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({ errors });
      }

      // TODO: simpan ke repository
      try {
        if (await fileRepository.get(metadata) != null) {
          res.status(StatusCodes.CONFLICT).send({ error: "file masih ada" });
          return;
        }
        await fileRepository.insert(metadata);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error });
        return;
      }

      const resBody = {
        fileId: metadata.fileId,
        fileUri: metadata.fileUri,
        fileThumbnailUri: metadata.fileThumbnailUri,
      }

      return res.status(StatusCodes.OK).send(resBody);
    }
  )
}

