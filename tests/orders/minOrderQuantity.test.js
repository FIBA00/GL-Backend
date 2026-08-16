// tests/orders/minOrderQuantity.test.js
import { ValidateOrderQuantity } from "../../src/services/order.service.js";

describe("ValidateOrderQuantity", function describeMinOrderValidation() {
  it("allows any quantity when the seller set no minimum", function noMinimumSetTest() {
    const product = { minOrderQuantity: null };
    expect(ValidateOrderQuantity(product, 1).valid).toBe(true);
  });

  it("rejects quantity below the seller's minimum when one is set", function belowMinimumTest() {
    const product = { minOrderQuantity: 50 };
    expect(ValidateOrderQuantity(product, 20).valid).toBe(false);
  });

  it("accepts quantity exactly at the seller's minimum", function atMinimumBoundaryTest() {
    const product = { minOrderQuantity: 50 };
    expect(ValidateOrderQuantity(product, 50).valid).toBe(true);
  });
});