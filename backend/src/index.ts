import { connectToPostgres } from "./loaders/postgres";
import { redisCache } from "./loaders/redis";
import { initMinioBuckets } from "./loaders/minio";
import { buildFastify, loadFastifyPlugins } from "./loaders/fastify";
import { env } from "./config/env";

const start = async () => {
  const app = buildFastify();

  await connectToPostgres();
  await initMinioBuckets();
  await loadFastifyPlugins(app);

  await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
  console.log(`🚀 Server running on port ${env.PORT}`);
};

start().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
