// src/services/exchangeRate/cachedExchangeRate.provider.js
const CACHE_TTL_SECONDS = 600; // 10 min — commodity-pegged rates don't need to be more real-time than this

function cacheKeyFor(commodityCode) {
	return "exchangeRate:" + commodityCode;
}

export function createCachedExchangeRateProvider(baseProvider, redisClient) {
	return {
		async getRate(commodityCode) {
			const key = cacheKeyFor(commodityCode);

			// FIX/rule: a Redis failure must never break rate lookups — always
			// fall through to the real provider rather than let the error propagate.
			try {
				const cachedValue = await redisClient.get(key);
				if (cachedValue !== null && cachedValue !== undefined) {
					return parseFloat(cachedValue);
				}
			} catch (error) {
				console.log(
					"Redis read failed, falling back to live provider:",
					error.message,
				);
			}

			const liveRate = await baseProvider.getRate(commodityCode);

			try {
				await redisClient.set(
					key,
					String(liveRate),
					"EX",
					CACHE_TTL_SECONDS,
				);
			} catch (error) {
				console.log(
					"Redis write failed, continuing without caching this result:",
					error.message,
				);
			}

			return liveRate;
		},
	};
}
