export async function getOrSetCache(key, ttlSeconds, redisClient, computeFn) {
	try {
		const cached = await redisClient.get(key);
		if (cached !== null && cached !== undefined) {
			return JSON.parse(cached);
		}
	} catch (error) {
		console.error(
			"Redis read failed for key" +
				key +
				", falling back to live computation:  ",
			error.message,
		);
	}
	const freshResult = await computeFn();
	try {
		await redisClient.set(
			key,
			JSON.stringify(freshResult),
			"EX",
			ttlSeconds,
		);
	} catch (error) {
		console.error(
			"Redis write failed for key " +
				key +
				", continuing without caching: ",
			error.message,
		);
	}
	return freshResult;
}
