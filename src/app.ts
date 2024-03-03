import fastify, { FastifyReply, FastifyRequest } from "fastify";
import fJWT, { JWT, FastifyJWT } from "@fastify/jwt";
import fCookie from "@fastify/cookie";
import cors from "@fastify/cors";
import router from "./router";
import {
  serializerCompiler,
  validatorCompiler,
} from "fastify-type-provider-zod";

declare module "fastify" {
  interface FastifyRequest {
    jwt: JWT;
  }

  export interface FastifyInstance {
    authenticate: any;
  }
}

declare module "@fastify/jwt" {
  interface FastifyJWT {
    user: {
      id: string;
      email: string;
    };
  }
}

const server = fastify({
  logger: true,
});

server.register(cors, {
  origin: "http://localhost:5173",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
});

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.register(fJWT, { secret: "secret" });

server.addHook("preHandler", (req, _, next) => {
  (req as any).jwt = server.jwt;
  return next();
});

server.register(fCookie, {
  secret: "secret",
  hook: "preHandler",
});

server.decorate(
  "authenticate",
  async (req: FastifyRequest, reply: FastifyReply) => {
    const token = req.cookies.access_token;

    if (!token) {
      return reply.status(401).send({ message: "Authentication required" });
    }

    const decoded = req.jwt.verify<FastifyJWT["user"]>(token);
    req.user = decoded;
  },
);

server.register(router);

export default server;
