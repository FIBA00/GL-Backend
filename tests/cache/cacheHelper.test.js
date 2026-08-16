import Redis from "ioredis-mock";
import { getOrSetCache } from "../../src/services/cache/cacheHelper.service.js";

describe("getOrSetCache", function describeGetOrSetCache() {
	it("runs computeFn and caches the result on a miss", async function cacheMissTest() {
		const redis = new Redis();
		let callCount = 0;
		const computeFn = async function compute() {
			callCount = callCount + 1;
			return { shops: ["a", "b"] };
		};

		const result = await getOrSetCache("test:key", 60, redis, computeFn);
		expect(result).toEqual({ shops: ["a", "b"] });
		expect(callCount).toBe(1);
	});

	it("returns the cached value on a hit without calling computeFn again", async function cacheHitTest() {
		const redis = new Redis();
		let callCount = 0;
		const computeFn = async function compute() {
			callCount = callCount + 1;
			return { shops: ["a", "b"] };
		};

		await getOrSetCache("test:key", 60, redis, computeFn);
		await getOrSetCache("test:key", 60, redis, computeFn);
		expect(callCount).toBe(1);
	});

	it("falls back to computeFn when Redis read fails (regression: cache is not a SPOF)", async function redisReadFailureFallbackTest() {
		const brokenRedis = {
			async get() {
				throw new Error("Connection refused");
			},
			async set() {
				throw new Error("Connection refused");
			},
		};
		const computeFn = async function compute() {
			return { shops: ["live-data"] };
		};

		const result = await getOrSetCache(
			"test:key",
			60,
			brokenRedis,
			computeFn,
		);
		expect(result).toEqual({ shops: ["live-data"] });
	});

	it("caches distinct keys independently", async function distinctKeysTest() {
		const redis = new Redis();
		const result1 = await getOrSetCache(
			"test:key1",
			60,
			redis,
			async function compute() {
				return { value: 1 };
			},
		);
		const result2 = await getOrSetCache(
			"test:key2",
			60,
			redis,
			async function compute() {
				return { value: 2 };
			},
		);
		expect(result1).toEqual({ value: 1 });
		expect(result2).toEqual({ value: 2 });
	});
});
