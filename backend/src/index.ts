import { connectToPostgres, initMinioBuckets } from "./loaders";
import { buildApp } from "./app";
import { env } from "./config/env";

const start = async () => {
  await connectToPostgres();
  await initMinioBuckets();

  const app = await buildApp();

  await app.listen({ port: Number(env.PORT), host: "0.0.0.0" });
};

start().catch((err) => {
  console.error("Failed to start server", err);
  process.exit(1);
});
