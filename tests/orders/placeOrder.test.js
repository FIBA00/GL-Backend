// tests/orders/placeOrder.test.js
import {
	connectTestDB,
	clearTestDB,
	closeTestDB,
} from "../helpers/db.helper.js";
import { createTestUser } from "../helpers/auth.helper.js";
import { createTestShop } from "../helpers/shop.helper.js";
import { createTestProduct } from "../helpers/product.helper.js";

import { PlaceOrder } from "../../src/services/order.service.js";
import { createFakeExchangeRateProvider } from "../../src/services/exchangeRate/fakeExchangeRate.provider.js";

import ProductModel from "../../src/models/product.model.js";
import OrdersModel from "../../src/models/orders.model.js";

beforeAll(async function setupDatabase() {
	await connectTestDB();
});

afterEach(async function resetDatabase() {
	await clearTestDB();
});

afterAll(async function teardownDatabase() {
	await closeTestDB();
});

describe("PlaceOrder", function describePlaceOrder() {
	it("blocks a shop owner from ordering their own products", async function selfOrderBlockedTest() {
		const owner = await createTestUser();
		const shop = await createTestShop(owner._id);
		const product = await createTestProduct(shop._id, { stock: 100 });
		const provider = createFakeExchangeRateProvider({ coffee: 200 });

		await expect(
			PlaceOrder(
				owner._id,
				shop._id,
				[{ productId: product._id, quantity: 10 }],
				provider,
			),
		).rejects.toThrow();
	});

	it("creates an order and decrements stock for a valid multi-product order", async function multiProductSuccessTest() {
		const owner = await createTestUser();
		const buyer = await createTestUser();
		const shop = await createTestShop(owner._id);
		const productA = await createTestProduct(shop._id, {
			stock: 100,
			commodityCode: "coffee",
			marginPercent: 10,
		});
		const productB = await createTestProduct(shop._id, {
			stock: 50,
			commodityCode: "sesame",
			marginPercent: 5,
		});
		const provider = createFakeExchangeRateProvider({
			coffee: 200,
			sesame: 100,
		});

		const order = await PlaceOrder(
			buyer._id,
			shop._id,
			[
				{ productId: productA._id, quantity: 20 },
				{ productId: productB._id, quantity: 10 },
			],
			provider,
		);

		expect(order.paymentStatus).toBe("unpaid");
		expect(order.fulfillmentStatus).toBe("pending");
		expect(order.products).toHaveLength(2);

		const reloadedA = await ProductModel.findById(productA._id);
		const reloadedB = await ProductModel.findById(productB._id);
		expect(reloadedA.stock).toBe(80);
		expect(reloadedB.stock).toBe(40);
	});

	it("rolls back ALL reservations when one line item has insufficient stock (regression: no partial orders)", async function allOrNothingRollbackTest() {
		const owner = await createTestUser();
		const buyer = await createTestUser();
		const shop = await createTestShop(owner._id);
		const productA = await createTestProduct(shop._id, {
			stock: 100,
			commodityCode: "coffee",
			marginPercent: 10,
		});
		const productB = await createTestProduct(shop._id, {
			stock: 5,
			commodityCode: "sesame",
			marginPercent: 5,
		}); // not enough
		const provider = createFakeExchangeRateProvider({
			coffee: 200,
			sesame: 100,
		});

		await expect(
			PlaceOrder(
				buyer._id,
				shop._id,
				[
					{ productId: productA._id, quantity: 20 }, // would succeed alone
					{ productId: productB._id, quantity: 10 }, // fails — only 5 in stock
				],
				provider,
			),
		).rejects.toThrow();

		// the critical assertion: productA's stock must be UNCHANGED, proving
		// the transaction rolled back rather than leaving a partial reservation
		const reloadedA = await ProductModel.findById(productA._id);
		expect(reloadedA.stock).toBe(100);

		const ordersCount = await OrdersModel.countDocuments();
		expect(ordersCount).toBe(0);
	});

	it("rejects when a product does not belong to the target shop", async function crossShopProductBlockedTest() {
		const ownerA = await createTestUser();
		const ownerB = await createTestUser();
		const buyer = await createTestUser();
		const shopA = await createTestShop(ownerA._id);
		const shopB = await createTestShop(ownerB._id);
		const productFromShopB = await createTestProduct(shopB._id, {
			stock: 100,
		});
		const provider = createFakeExchangeRateProvider({ coffee: 200 });

		await expect(
			PlaceOrder(
				buyer._id,
				shopA._id,
				[{ productId: productFromShopB._id, quantity: 5 }],
				provider,
			),
		).rejects.toThrow();
	});
});
