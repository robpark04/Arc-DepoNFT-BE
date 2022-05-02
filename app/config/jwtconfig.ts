import fastify, { FastifyInstance } from 'fastify';
import { config } from './config'
import fastifyJWT from 'fastify-jwt';


export async function jwt(app: FastifyInstance) {
  if (!app) {
    app = fastify();
  }
  await app.register(fastifyJWT, { ...config.jwt, secret: config.jwt.secret });
  return app;
}