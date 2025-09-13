import { fastify } from "fastify";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";

const server = fastify({ }).withTypeProvider<TypeBoxTypeProvider>();


server.setErrorHandler(function (error, _, reply) {
  if (error.statusCode) {
    if (error.statusCode == StatusCodes.BAD_REQUEST.valueOf()) {
      reply.status(StatusCodes.BAD_REQUEST).type("application/json").send({
        message: error.message,
      });
      return;
    }

    console.warn(JSON.stringify(error));
    reply.status(error.statusCode).type("application/json").send({
      message: error.message,
    });
    return;
  }

  console.error(error);
  reply.status(StatusCodes.INTERNAL_SERVER_ERROR).send();
  return;
});

server.listen({ port: 30000 }, function (err, _) {
  if (err) {
    console.error(err, "Error when listening");
    process.exit(1);
  }
});

