import { redisCache } from "./src/loaders";

async function test() {
  try {
    const keys = await redisCache.keys("cache:videos:*");
    console.log("Keys:", keys);
    if (keys.length > 0) {
      const val = await redisCache.get(keys[0]);
      console.log("Value:", val);
    }
  } catch (err: any) {
    console.error("Error:", err.message);
  }
  process.exit(0);
}

test();
