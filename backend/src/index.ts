import { connect } from "node:http2";
import {
  buildFastify,
  connectToPostgres,
  initMinioBuckets,
  loadFastifyPlugins,
} from "./loaders";
import { healthRoutes } from "./modules/health/health.routes";
import { env } from "./config/env";

const start = async () => {
  const app = buildFastify();

  await connectToPostgres();
  await initMinioBuckets();
  await loadFastifyPlugins(app);

  await healthRoutes.register(app);

  await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
