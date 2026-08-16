// tests/orders/cachedExchangeRate.test.js
import Redis from "ioredis-mock";
import { createCachedExchangeRateProvider } from "../../src/services/exchangeRate/cachedExchangeRate.provider.js";
import { createFakeExchangeRateProvider } from "../../src/services/exchangeRate/fakeExchangeRate.provider.js";

describe("CachedExchangeRateProvider", function describeCachedProvider() {
	it("calls the underlying provider on a cache miss and stores the result", async function cacheMissTest() {
		const redis = new Redis();
		let callCount = 0;
		const baseProvider = {
			async getRate(commodityCode) {
				callCount = callCount + 1;
				return 200;
			},
		};
		const cached = createCachedExchangeRateProvider(baseProvider, redis);

		const rate = await cached.getRate("coffee");
		expect(rate).toBe(200);
		expect(callCount).toBe(1);
	});

	it("serves from cache on a hit, without calling the underlying provider again", async function cacheHitTest() {
		const redis = new Redis();
		let callCount = 0;
		const baseProvider = {
			async getRate(commodityCode) {
				callCount = callCount + 1;
				return 200;
			},
		};
		const cached = createCachedExchangeRateProvider(baseProvider, redis);

		await cached.getRate("coffee"); // miss, populates cache
		await cached.getRate("coffee"); // hit
		expect(callCount).toBe(1); // underlying provider called only once
	});

	it("falls back to the underlying provider when Redis is unavailable (regression: cache must not be a SPOF)", async function redisFailureFallbackTest() {
		const brokenRedis = {
			async get() {
				throw new Error("Connection refused");
			},
			async set() {
				throw new Error("Connection refused");
			},
		};
		const baseProvider = createFakeExchangeRateProvider({ coffee: 200 });
		const cached = createCachedExchangeRateProvider(
			baseProvider,
			brokenRedis,
		);

		const rate = await cached.getRate("coffee");
		expect(rate).toBe(200); // still works — Redis being down didn't break the request
	});

	it("caches different commodities under separate keys", async function separateKeysTest() {
		const redis = new Redis();
		const baseProvider = createFakeExchangeRateProvider({
			coffee: 200,
			sesame: 100,
		});
		const cached = createCachedExchangeRateProvider(baseProvider, redis);

		expect(await cached.getRate("coffee")).toBe(200);
		expect(await cached.getRate("sesame")).toBe(100);
	});
});
