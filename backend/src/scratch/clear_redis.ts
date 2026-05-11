import { redisCache } from "../loaders";

async function main() {
  try {
    console.log("Clearing Redis cache...");
    const keys = await redisCache.keys("cache:*");
    if (keys.length > 0) {
      await redisCache.del(keys);
      console.log("Redis cache cleared successfully!");
    } else {
      console.log("No cache keys found.");
    }
    process.exit(0);
  } catch (err) {
    console.error("Error clearing Redis cache:", err);
    process.exit(1);
  }
}

main();
