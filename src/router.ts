import { FastifyInstance } from "fastify";
import userController from "./controller/userController";
import indexController from "./controller/indexController";
import pointController from "./controller/pointController";

export default async function router(fastify: FastifyInstance) {
  fastify.register(indexController, { prefix: "/" });
  fastify.register(userController, { prefix: "/users" });
  fastify.register(pointController, { prefix: "/points" });
}
