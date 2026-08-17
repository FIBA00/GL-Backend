// src/configs/redis.config.js
import Redis from "ioredis";
import "./env.config.js";

const redisClient = new Redis({
	host: process.env.REDIS_HOST || "127.0.0.1",
	port: process.env.REDIS_PORT || 6379,

	// The actual fix for the hang: without this, commands queue and wait
	// indefinitely for a reconnect instead of failing fast.
	enableOfflineQueue: false,

	// How long to wait for the initial TCP connection before giving up —
	// covers slow/firewalled hosts, not just instant DNS failures like ours.
	connectTimeout: 3000,

	// Caps how long a single command waits for a reply — protects against
	// a Redis that accepted the connection but is unresponsive, a different
	// failure mode than "can't connect at all".
	commandTimeout: 2000,

	maxRetriesPerRequest: 1,
});

// Throttled logging, not throttled retrying — ioredis's default backoff
// keeps trying to reconnect indefinitely in the background (cheap), so if
// you start Redis mid dev-session it self-heals with no restart needed.
// We only rate-limit the console spam, not the reconnect attempts.
let lastLoggedAt = 0;
redisClient.on("error", function handleRedisError(error) {
	const now = Date.now();
	if (now - lastLoggedAt > 15000) {
		console.log(
			"Redis unavailable (" +
				error.message +
				") — continuing without cache.",
		);
		lastLoggedAt = now;
	}
});

export default redisClient;
