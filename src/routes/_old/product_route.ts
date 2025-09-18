import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { Server } from "./types.js";
import { User, EmailDTO, PhoneDTO } from "./model.user.ts";
import { userRepository } from "./repo.user.ts";
import { hashPassword, generateToken, comparePassword } from "./helper.auth.ts";
import { randomUUID } from "node:crypto";
import { enumRoutes } from "./enum.routes.js";

export function postProductandler(s: Server) {
  s.post(
    enumRoutes.PRODUCT,
    {
      schema: {
        body: Type.Object({
          name: Type.String(),
          category: Type.String(),
          qty: Type.Number(),
          price: Type.Number(),
          sku: Type.String(),
          fileId: Type.String(),
          fileUri: Type.String(),
          fileThumbnailUri: Type.String(),
        }),
      },
    },
    async (req, res) => {
      const dto = new EmailDTO(req.body);

      const errors = dto.validate();

      if (errors.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({ errors });
      }

      // TODO: parse req.body to User
      const user = new User();
      user.id = randomUUID();
      user.email = dto.email;
      user.password = await hashPassword(dto.password);
      try {
        if ((await userRepository.get(user)) != null) {
          res
            .status(StatusCodes.CONFLICT)
            .send({ error: "Email sudah terdaftar" });
          return;
        }
        await userRepository.insert(user);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error });
        return;
      }
      res
        .status(StatusCodes.CREATED)
        .send({
          email: user.email,
          phone: user.phone,
          token: generateToken({ id: user.id }),
        });
    },
  );
}
