// src/configs/redis.config.js
import Redis from "ioredis";
import "./env.config.js";

const redisClient = new Redis({
  host: process.env.REDIS_HOST || "redis", // Docker service name — same internal-vs-browser distinction we established for Mongo earlier
  port: process.env.REDIS_PORT || 6379,
  lazyConnect: false,
  maxRetriesPerRequest: 2, // fail fast rather than hang the request queue if Redis is unreachable
});

redisClient.on("error", function handleRedisError(error) {
  console.log("Redis client error:", error.message);
});

export default redisClient;