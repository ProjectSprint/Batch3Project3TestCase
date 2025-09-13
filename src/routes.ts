import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { Server } from "./types.js";
import { User, EmailDTO, PhoneDTO } from "./model.user.ts";
import { userRepository } from "./repo.user.ts";
import { hashPassword, generateToken } from "./helper.auth.ts";
import { randomUUID } from "node:crypto";

// TODO: Register and store return email token
export function registerEmailHandler(s: Server) {
  s.post(
    "/v1/register/email",
    {
      schema: {
        body: Type.Object({
          email: Type.String(),
          password: Type.String(),
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
      var user = new User();
      user.id = randomUUID();
      user.email = dto.email;
      user.password = await hashPassword(dto.password);
      try {
        user = await userRepository.insert(user);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({});
      }

      res.status(StatusCodes.OK).send({ email: user.email, phone: user.phone, token: generateToken(user) });
    },
  );
}
// TODO: Register and store return phone token
export function registerPhoneHandler(s: Server) {
  s.post(
    "/v1/register/phone",
    {
      schema: {
        body: Type.Object({
          phone: Type.String(),
          password: Type.String(),
        }),
      },
    },
    async (req, res) => {
      const dto = new PhoneDTO(req.body);
      const errors = dto.validate();

      if (errors.length > 0) {
        return res.status(StatusCodes.BAD_REQUEST).send({ errors });
      }

      // TODO: parse req.body to User
      var user = new User();
      user.id = randomUUID();
      user.phone = dto.phone;
      user.password = await hashPassword(dto.password);

      try {
        user = await userRepository.insert(user);
      } catch (erro) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({});
      }

      res.status(StatusCodes.OK).send({ email: user.email, phone: user.phone, token: generateToken(user) });
    },
  );
}

export function registerAuthHandler(s: Server) {
  s.post(
    "/easteregg/auth",
    {
      schema: {
        body: Type.Object({
          name: Type.String(),
          nickname: Type.String(),
          email: Type.String(),
          package: Type.String(),
          addOns: Type.Optional(Type.Array(Type.String())),
          discounts: Type.Optional(Type.Array(Type.String())),
          socialMediaUsername: Type.String(),
          preferredTeammateDiscordId: Type.String(),
        }),
      },
    },
    async (req, res) => {
      res.status(StatusCodes.OK).send({ message: "ok" });
    },
  );
}
