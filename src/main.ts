import { fastify } from "fastify";
import  multipart from "@fastify/multipart";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import { StatusCodes } from "http-status-codes";
import {
  registerEmailHandler,
  registerPhoneHandler,
  loginEmailHandler,
  loginPhoneHandler,
} from "./routes.js";
import { postFileHandler } from "./routes.file.ts";
import { verifyToken } from "./helper.auth.js";
import { enumRoutes } from "./enum.routes.js";

const server = fastify({ }).withTypeProvider<TypeBoxTypeProvider>();

// middlewares
// global panic handler
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

server.register(multipart, {});

// authentication
server.addHook('preHandler', async (request: any, reply) => {
  // Kalau route public, skip
  const publicRoutes = [
    enumRoutes.REGISTER_EMAIL,
    enumRoutes.REGISTER_PHONE,
    enumRoutes.LOGIN_EMAIL,
    enumRoutes.LOGIN_PHONE,
  ];
  if (publicRoutes.includes(request.url)) return;

  const authHeader = request.headers['authorization'] ?? request.headers['Authorization'];
  if (!authHeader) {
    return reply.status(401).send({ error: 'Authorization header missing' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = verifyToken(token);
    request.user = decoded;
  } catch (err) {
    return reply.status(401).send({ error: 'Invalid token' });
  }
});

// handlers route
registerEmailHandler(server);
registerPhoneHandler(server);

loginEmailHandler(server);
loginPhoneHandler(server);

postFileHandler(server);

// start server
server.listen({ port: 30000 }, function (err, _) {
  if (err) {
    console.error(err, "Error when listening");
    process.exit(1);
  }
});

console.log("Server listening on http://localhost:30000");

