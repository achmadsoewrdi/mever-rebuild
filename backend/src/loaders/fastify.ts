import Fastify, { FastifyInstance } from "fastify";
import fastifyCors from "@fastify/cors";
import fastifyJwt from "@fastify/jwt";
import fastifyMultipart from "@fastify/multipart";
import { env } from "../config/env";

export const buildFastify = (): FastifyInstance => {
  return Fastify({
    logger: true,
  });
};

export const loadFastifyPlugins = async (app: FastifyInstance) => {
  // CORS
  await app.register(fastifyCors, {
    origin: true,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  });

  // JWT
  await app.register(fastifyJwt, {
    secret: env.JWT_SECRET,
    sign: {
      expiresIn: env.JWT_EXPIRES_IN,
    },
  });

  // Multipart (untuk upload file)
  await app.register(fastifyMultipart, {
    limits: {
      fileSize: 50 * 1024 * 1024,
    },
  });

  // Decorator untuk proteksi route
  app.decorate("authenticate", async (request: any, reply: any) => {
    try {
      await request.jwtVerify();
    } catch (e) {
      reply.send(e);
    }
  });

  console.log("✅ Fastify plugins loaded (CORS, JWT, Multipart)");
};
