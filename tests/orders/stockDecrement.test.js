import ProductModel from "../../src/models/product.model.js";
import {
	connectTestDB,
	clearTestDB,
	closeTestDB,
} from "../helpers/db.helper.js";
import { createTestUser } from "../helpers/auth.helper.js";
import { createTestShop } from "../helpers/shops.helper.js";
import { createTestProduct } from "../helpers/product.helper.js";
import { ReserveStock } from "../../src/services/order.service.js";

beforeAll(async function setupDatabase() {
	await connectTestDB();
});

afterEach(async function resetDatabase() {
	await clearTestDB();
});

afterAll(async function teardownDatabase() {
	await closeTestDB();
});

describe("ReserveStock", function describeReserveStock() {
	it("decrements stock atomically when enough is available", async function successfulReserveTest() {
		const owner = await createTestUser();
		const shop = await createTestShop(owner._id);
		const product = await createTestProduct(shop._id, { stock: 20 });

		const result = await ReserveStock(product._id, 5);
		expect(result.success).toBe(true);

		const reloaded = await ProductModel.findById(product._id);
		expect(reloaded.stock).toBe(15);
	});

	it("fails without decrementing when requested quantity exceeds stock", async function insufficientStockTest() {
		const owner = await createTestUser();
		const shop = await createTestShop(owner._id);
		const product = await createTestProduct(shop._id, { stock: 5 });

		const result = await ReserveStock(product._id, 10);
		expect(result.success).toBe(false);

		const reloaded = await ProductModel.findById(product._id);
		expect(reloaded.stock).toBe(5); // unchanged
	});

	it("only one of two concurrent requests for the same last units succeeds", async function concurrentReserveTest() {
		const owner = await createTestUser();
		const shop = await createTestShop(owner._id);
		const product = await createTestProduct(shop._id, { stock: 10 });

		const [resultA, resultB] = await Promise.all([
			ReserveStock(product._id, 8),
			ReserveStock(product._id, 8),
		]);

		const successes = [resultA, resultB].filter(function isSuccess(r) {
			return r.success;
		});
		expect(successes).toHaveLength(1);

		const reloaded = await ProductModel.findById(product._id);
		expect(reloaded.stock).toBe(2); // 10 - 8, the winning request only
	});
});
