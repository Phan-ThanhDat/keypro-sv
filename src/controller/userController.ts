import { FastifyInstance, FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import bcrypt from "bcrypt";
import { pool } from "../pg";

const userLoginSchema = z.object({
  email: z
    .string({
      required_error: "Email is required",
      invalid_type_error: "Email must be a string",
    })
    .email(),
  password: z.string().min(6),
});

type UserLoginSchema = z.infer<typeof userLoginSchema>;

export default async function userController(fastify: FastifyInstance) {
  fastify.post(
    "/login",
    { schema: { body: userLoginSchema } },
    async function (request: FastifyRequest, reply: FastifyReply) {
      const { email, password } = request.body as UserLoginSchema;

      const result = await pool.query("SELECT * FROM users WHERE email = $1", [
        email,
      ]);

      if (result.rows.length === 0) {
        return reply.status(401).send({ message: "Invalid email or password" });
      }

      const user = result.rows[0];

      const passwordMatch = await bcrypt.compare(password, user.password);

      if (!passwordMatch) {
        return reply.status(401).send({ message: "Invalid email or password" });
      }

      const payload = {
        id: user.id,
        email: user.email,
      };

      const token = request.jwt.sign(payload);

      reply.setCookie("access_token", token, {
        path: "/",
        httpOnly: true,
        expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        domain: process.env.COOKIE_DOMAIN,
        secure: true,
        sameSite: "none",
      });

      return { accessToken: token, user: payload };
    },
  );

  fastify.get(
    "/me",
    {
      preHandler: [fastify.authenticate],
    },
    async function (request: FastifyRequest) {
      const requestUser = request.user;
      return { user: requestUser };
    },
  );

  fastify.delete(
    "/logout",
    { preHandler: [fastify.authenticate] },
    async function (_, reply) {
      reply.clearCookie("access_token", {
        path: "/",
        httpOnly: true,
        domain: process.env.COOKIE_DOMAIN,
        secure: true,
        sameSite: "none",
      });

      return { message: "Logged out" };
    },
  );
}
