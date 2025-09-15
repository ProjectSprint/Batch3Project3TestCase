import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { Server } from "./types.js";
import { User, EmailDTO, PhoneDTO } from "./model.user.ts";
import { userRepository } from "./repo.user.ts";
import { hashPassword, generateToken, comparePassword } from "./helper.auth.ts";
import { randomUUID } from "node:crypto";
import { enumRoutes } from "./enum.routes.js";

export function registerEmailHandler(s: Server) {
  s.post(
    enumRoutes.PRODUCT,
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
        if (await userRepository.get(user) != null) {
          res.status(StatusCodes.CONFLICT).send({ error: "Email sudah terdaftar" });
          return;
        }
        await userRepository.insert(user);
      } catch (error) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error });
        return;
      }
      res.status(StatusCodes.CREATED).send({ email: user.email, phone: user.phone, token: generateToken({id: user.id}) });
    },
  );
}
export function registerPhoneHandler(s: Server) {
  s.post(
    enumRoutes.REGISTER_PHONE,
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
        if (await userRepository.get(user) != null) {
          res.status(StatusCodes.CONFLICT).send({ error: "" });
          return;
        }
        await userRepository.insert(user);
      } catch (erro) {
        res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({});
      }

      res.status(StatusCodes.CREATED).send({ email: user.email, phone: user.phone, token: generateToken({id: user.id}) });
    },
  );
}
// LOGIN SCENARIO
export function loginEmailHandler(s: Server) {
  s.post(
     enumRoutes.LOGIN_EMAIL,
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
       user.email = dto.email;
       try {
         const userRecord = await userRepository.get(user);

        if (userRecord == null) {
          res.status(StatusCodes.NOT_FOUND).send({ error: "" });
          return;
        }

        if (!await comparePassword( dto.password, userRecord.password)) {
          res.status(StatusCodes.BAD_REQUEST).send({ error: "" });
          return;
        }

       } catch (error) {
         console.log(error);
         res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error });
         return;
       }
       res.status(StatusCodes.OK).send({ email: user.email, phone: user.phone, token: generateToken({id: user.id}) });
     },
   );
 }

// LOGIN SCENARIO
export function loginPhoneHandler(s: Server) {
  s.post(
     enumRoutes.LOGIN_PHONE,
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
       user.phone = dto.phone;
       try {
         const userRecord = await userRepository.get(user);

        if (userRecord == null) {
          res.status(StatusCodes.NOT_FOUND).send({ error: "not exist" });
          return;
        }

          if (!await comparePassword( dto.password, userRecord.password)) {
            res.status(StatusCodes.BAD_REQUEST).send({ error: "wrong password" });
            return;
          }

       } catch (error) {
         console.log(error);
         res.status(StatusCodes.INTERNAL_SERVER_ERROR).send({ error });
         return;
       }
       res.status(StatusCodes.OK).send({ email: user.email, phone: user.phone, token: generateToken({id: user.id}) });
    },
  );
}



//
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
