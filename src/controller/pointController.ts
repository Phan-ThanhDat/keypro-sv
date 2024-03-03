import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { pool } from "../pg";
import z from "zod";

const createPointSchema = z.object({
  lat: z.number(),
  lng: z.number(),
  labelSize: z.string(),
  category: z.string(),
  installYear: z.number(),
  usageState: z.string(),
  owner: z.string(),
});

type CreatePointSchema = z.infer<typeof createPointSchema>;

const updatePointSchema = z.object({
  lat: z.number().optional(),
  lng: z.number().optional(),
  labelSize: z.string().optional(),
  category: z.string().optional(),
  installYear: z.number().optional(),
  usageState: z.string().optional(),
  owner: z.string().optional(),
});

type UpdatePointSchema = z.infer<typeof updatePointSchema>;

export default async function pointController(fastify: FastifyInstance) {
  fastify.get(
    "/",
    {
      preHandler: [fastify.authenticate],
    },
    async function (request: FastifyRequest) {
      const requestUser = request.user;

      const result = await pool.query(
        `SELECT * FROM points WHERE "createdBy" = $1`,
        [requestUser.id],
      );

      return { data: result.rows };
    },
  );

  fastify.post(
    "/",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: createPointSchema,
      },
    },
    async function (request: FastifyRequest) {
      const requestUser = request.user;
      const body = request.body as CreatePointSchema;

      const result = await pool.query(
        `INSERT INTO points (lat, lng, "labelSize", category, "installYear", "usageState", owner, "createdBy") VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING *`,
        [
          body.lat,
          body.lng,
          body.labelSize,
          body.category,
          body.installYear,
          body.usageState,
          body.owner,
          requestUser.id,
        ],
      );

      return { data: result.rows[0] };
    },
  );

  fastify.put(
    "/:id",
    {
      preHandler: [fastify.authenticate],
      schema: {
        body: updatePointSchema,
      },
    },
    async function (request: FastifyRequest<{ Params: { id: string } }>) {
      const requestUser = request.user;
      const id = request.params.id;
      const body = request.body as UpdatePointSchema;

      const result = await pool.query(
        `UPDATE points SET lat = COALESCE($1, lat), lng = COALESCE($2, lng), "labelSize" = COALESCE($3, "labelSize"), category = COALESCE($4, category), "installYear" = COALESCE($5, "installYear"), "usageState" = COALESCE($6, "usageState"), owner = COALESCE($7, owner) WHERE id = $8 AND "createdBy" = $9 RETURNING *`,
        [
          body.lat,
          body.lng,
          body.labelSize,
          body.category,
          body.installYear,
          body.usageState,
          body.owner,
          id,
          requestUser.id,
        ],
      );

      if (result.rowCount === 0) {
        return { message: "Point not found" };
      }

      return { data: result.rows[0] };
    },
  );

  fastify.delete(
    "/:id",
    {
      preHandler: [fastify.authenticate],
    },
    async function (
      request: FastifyRequest<{ Params: { id: string } }>,
      reply: FastifyReply,
    ) {
      const requestUser = request.user;
      const id = request.params.id;

      const result = await pool.query(
        `DELETE FROM points WHERE id = $1 AND "createdBy" = $2 RETURNING *`,
        [id, requestUser.id],
      );

      if (result.rowCount === 0) {
        return reply.status(404).send({ message: "Point not found" });
      }

      return { data: result.rows[0] };
    },
  );
}
