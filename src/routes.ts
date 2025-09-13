import { Type } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import { Server } from "./types.js";

export function registerAuthHandler(s: Server) {
  s.post(
    "/",
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
