import Redis from "ioredis-mock";
import {
	connectTestDB,
	clearTestDB,
	closeTestDB,
} from "../helpers/db.helper.js";
import { createTestUser } from "../helpers/auth.helper.js";
import { createTestShop, createTestCategory } from "../helpers/shops.helper.js";
import {
	buildShopListingCacheKey,
	getCachedShopListing,
} from "../../src/services/cache/shopListing.cache.js";

beforeAll(async function setupDatabase() {
	await connectTestDB();
});

afterEach(async function resetDatabase() {
	await clearTestDB();
});

afterAll(async function teardownDatabase() {
	await closeTestDB();
});

describe("buildShopListingCacheKey", function describeCacheKeyBuilder() {
	it("produces distinct keys for different page/limit combinations", function distinctKeyShapeTest() {
		const keyA = buildShopListingCacheKey({ page: 1, limit: 10 });
		const keyB = buildShopListingCacheKey({ page: 2, limit: 10 });
		expect(keyA).not.toBe(keyB);
	});

	it("defaults category to 'all' when not provided", function categoryDefaultTest() {
		const key = buildShopListingCacheKey({ page: 1, limit: 10 });
		expect(key).toContain("category=all");
	});
});

describe("getCachedShopListing", function describeGetCachedShopListing() {
	it("returns live data on first call and caches it", async function firstCallMissTest() {
		const redis = new Redis();
		const owner = await createTestUser();
		const category = await createTestCategory();
		await createTestShop(owner._id, {
			name: "Shop One",
			category: category._id,
		});

		const result = await getCachedShopListing(
			{ page: 1, limit: 10 },
			redis,
		);
		expect(result.shops).toHaveLength(1);
	});

	it("serves stale-but-cached data on a second call, even after a new shop is created (expected 60s staleness)", async function cachedStalenessTest() {
		const redis = new Redis();
		const owner = await createTestUser();
		const category = await createTestCategory();
		await createTestShop(owner._id, {
			name: "Shop One",
			category: category._id,
		});

		const firstResult = await getCachedShopListing(
			{ page: 1, limit: 10 },
			redis,
		);
		expect(firstResult.shops).toHaveLength(1);

		await createTestShop(owner._id, {
			name: "Shop Two",
			category: category._id,
		}); // written after cache populated

		const secondResult = await getCachedShopListing(
			{ page: 1, limit: 10 },
			redis,
		);
		// this is intentional per our TTL design, not a bug — documenting the
		// agreed tradeoff as a test so nobody "fixes" it later without noticing
		expect(secondResult.shops).toHaveLength(1);
	});
});
