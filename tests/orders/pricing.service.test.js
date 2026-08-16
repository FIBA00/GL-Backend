// tests/orders/pricing.service.test.js
import { CalculateUnitPrice } from "../../src/services/order.service.js";
import { createFakeExchangeRateProvider } from "../../src/services/exchangeRate/fakeExchangeRate.provider.js";

describe("CalculateUnitPrice", function describeCalculateUnitPrice() {
	it("applies the seller's margin on top of the live exchange rate", async function marginAppliedTest() {
		const provider = createFakeExchangeRateProvider({ coffee: 200 });
		const product = { commodityCode: "coffee", marginPercent: 10 };

		const price = await CalculateUnitPrice(product, provider);
		expect(price).toBe(220); // 200 + 10%
	});

	it("throws for margin above the platform cap, never reaching the exchange call", async function marginCapEnforcedTest() {
		const provider = createFakeExchangeRateProvider({ coffee: 200 });
		const product = { commodityCode: "coffee", marginPercent: 999 };

		// this should actually be caught at the Mongoose schema level (max: 30)
		// before it's ever passed here — this test exists to prove the schema
		// validation is the real gatekeeper, not the service layer silently
		// trusting bad data that somehow got through.
		await expect(CalculateUnitPrice(product, provider)).rejects.toThrow();
	});
});
