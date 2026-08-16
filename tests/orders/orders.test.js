import ProductModel from "../../src/models/product.model.js";
import OrdersModel from "../../src/models/orders.model.js";
import {
	CalculateOrderTotal,
	ValidateStockAvailability,
} from "../../src/services/order.service.js";

describe("ValidaeStockAvailablity", function describeStockValidation() {
	it("rejects an order when requested quantity exceeds available stock", function insufficientStockTest() {
		const product = { stock: 10, price: 500 };
		const result = ValidateStockAvailability(product, 15);
		expect(result.valid).toBe(false);
	});

	it("accepts and order when requested quantity equals available stock exactly.", function exactStockBoundaryTest() {
		const product = { stock: 10, price: 500 };
		const result = ValidateStockAvailability(product, 10);
		expect(result.valid).toBe(true);
	});

	it("does not oversell when two orders race for the same stock", async function concurrentOrderReaceTest() {
		const shop = await createTestShop(merchantOwner._id);
		const product = await createTestProduct(shop._id, { stock: 10 });
		const [resA, resB] = await Promise.all([
			request(App).post("/api/orders").set(authHeaderFor(buyerA)).send({
				productId: product._id,
				quantity: 8,
			}),
			request(App).post("/api/orders").set(authHeaderFor(buyerB)).send({
				productId: product._id,
				quantity: 8,
			}),
		]);
		const successCount = [resA, resB].filter(function isSuccess(r) {
			return r.status === 201;
		}).length;
		expect(successCount).toBe(1);
    });
    it("locks in the unit price at order time, unaffected by later price changes", async function priceSnapShotTest() {
        const product = await createTestProduct(shop._id, { price: 1000 });
        const order = await placeOrder(buyer, shop, [ {
            product: product:_id, quantity: 5
        } ]) 
        await ProductModel.findByIdAndUpdate(product._id, { price: 1500 }) // price moves after order placed
        const reloaded = await OrdersModel.findById(order._id);
        expect(reloaded.products[ 0 ].unitPrice).toBe(1000); // 1500
    })
});
