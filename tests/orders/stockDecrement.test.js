// tests/orders/stockDecrement.test.js
import ProductModel from "../../src/models/product.model.js";
import { ReserveStock } from "../../src/services/order.service.js";

describe("ReserveStock", function describeReserveStock() {
	it("decrements stock atomically when enough is available", async function successfulReserveTest() {
		const product = await ProductModel.create({
			stock: 20,
		});
		const result = await ReserveStock(product._id, 5);
		expect(result.success).toBe(true);

		const reloaded = await ProductModel.findById(product._id);
		expect(reloaded.stock).toBe(15);
	});

	it("fails without decrementing when requested quantity exceeds stock", async function insufficientStockTest() {
		const product = await ProductModel.create({ stock: 5 });
		const result = await ReserveStock(product._id, 10);
		expect(result.success).toBe(false);

		const reloaded = await ProductModel.findById(product._id);
		expect(reloaded.stock).toBe(5); // unchanged
	});

	it("only one of two concurrent requests for the same last units succeeds", async function concurrentReserveTest() {
		const product = await ProductModel.create({ stock: 10 });

		const [resultA, resultB] = await Promise.all([
			ReserveStock(product._id, 8),
			ReserveStock(product._id, 8),
		]);

		const successes = [resultA, resultB].filter(function isSuccess(r) {
			return r.success;
		});
		expect(successes).toHaveLength(1);
	});
});
