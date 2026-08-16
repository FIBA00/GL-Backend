import request from "supertest";
import App from "../../app.js";
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.helper.js";
import { createTestUser, authHeaderFor } from "../helpers/auth.helper.js";
import { createTestShop } from "../helpers/shops.helper.js";
import { createTestProduct } from "../helpers/product.helper.js";

beforeAll(async function setupDatabase() {
  await connectTestDB();
});

afterEach(async function resetDatabase() {
  await clearTestDB();
});

afterAll(async function teardownDatabase() {
  await closeTestDB();
});

describe("POST /api/orders", function describeCreateOrder() {
  it("creates an order for a valid multi-product request", async function createOrderSuccessTest() {
    const owner = await createTestUser();
    const buyer = await createTestUser();
    const shop = await createTestShop(owner._id);
    const product = await createTestProduct(shop._id, { stock: 100, commodityCode: "coffee" });

    const res = await request(App)
      .post("/api/orders")
      .set(authHeaderFor(buyer))
      .send({
        shopId: shop._id.toString(),
        products: [{ productId: product._id.toString(), quantity: 10 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.order.fulfillmentStatus).toBe("pending");
    expect(res.body.order.paymentStatus).toBe("unpaid");
  });

  it("rejects a shop owner ordering from their own shop", async function selfOrderBlockedControllerTest() {
    const owner = await createTestUser();
    const shop = await createTestShop(owner._id);
    const product = await createTestProduct(shop._id, { stock: 100 });

    const res = await request(App)
      .post("/api/orders")
      .set(authHeaderFor(owner))
      .send({ shopId: shop._id.toString(), products: [{ productId: product._id.toString(), quantity: 5 }] });

    expect(res.status).toBe(400);
  });

  it("rejects with 400 (not 500) when a line item has insufficient stock", async function insufficientStockControllerTest() {
    const owner = await createTestUser();
    const buyer = await createTestUser();
    const shop = await createTestShop(owner._id);
    const product = await createTestProduct(shop._id, { stock: 3 });

    const res = await request(App)
      .post("/api/orders")
      .set(authHeaderFor(buyer))
      .send({ shopId: shop._id.toString(), products: [{ productId: product._id.toString(), quantity: 10 }] });

    expect(res.status).toBe(400);
  });

  it("rejects an unauthenticated request", async function noAuthOrderTest() {
    const res = await request(App).post("/api/orders").send({ shopId: "x", products: [] });
    expect(res.status).toBe(401);
  });
});

describe("GET /api/orders/mine", function describeMyOrders() {
  it("returns only the requesting buyer's orders", async function myOrdersScopedTest() {
    const owner = await createTestUser();
    const buyerA = await createTestUser();
    const buyerB = await createTestUser();
    const shop = await createTestShop(owner._id);
    const product = await createTestProduct(shop._id, { stock: 100 });

    await request(App).post("/api/orders").set(authHeaderFor(buyerA)).send({
      shopId: shop._id.toString(),
      products: [{ productId: product._id.toString(), quantity: 5 }],
    });

    const res = await request(App).get("/api/orders/mine").set(authHeaderFor(buyerB));
    expect(res.status).toBe(200);
    expect(res.body.orders).toHaveLength(0); // buyerB placed nothing
  });
});

describe("GET /api/orders/:id ownership", function describeOrderDetailOwnership() {
  it("allows the buyer to view their own order", async function buyerViewOwnOrderTest() {
    const owner = await createTestUser();
    const buyer = await createTestUser();
    const shop = await createTestShop(owner._id);
    const product = await createTestProduct(shop._id, { stock: 100 });

    const createRes = await request(App).post("/api/orders").set(authHeaderFor(buyer)).send({
      shopId: shop._id.toString(),
      products: [{ productId: product._id.toString(), quantity: 5 }],
    });
    const orderId = createRes.body.order._id;

    const res = await request(App).get("/api/orders/" + orderId).set(authHeaderFor(buyer));
    expect(res.status).toBe(200);
  });

  it("allows the shop owner to view an order placed against their shop", async function shopOwnerViewOrderTest() {
    const owner = await createTestUser();
    const buyer = await createTestUser();
    const shop = await createTestShop(owner._id);
    const product = await createTestProduct(shop._id, { stock: 100 });

    const createRes = await request(App).post("/api/orders").set(authHeaderFor(buyer)).send({
      shopId: shop._id.toString(),
      products: [{ productId: product._id.toString(), quantity: 5 }],
    });
    const orderId = createRes.body.order._id;

    const res = await request(App).get("/api/orders/" + orderId).set(authHeaderFor(owner));
    expect(res.status).toBe(200);
  });

  it("blocks an unrelated third party from viewing the order", async function strangerBlockedFromOrderTest() {
    const owner = await createTestUser();
    const buyer = await createTestUser();
    const stranger = await createTestUser();
    const shop = await createTestShop(owner._id);
    const product = await createTestProduct(shop._id, { stock: 100 });

    const createRes = await request(App).post("/api/orders").set(authHeaderFor(buyer)).send({
      shopId: shop._id.toString(),
      products: [{ productId: product._id.toString(), quantity: 5 }],
    });
    const orderId = createRes.body.order._id;

    const res = await request(App).get("/api/orders/" + orderId).set(authHeaderFor(stranger));
    expect(res.status).toBe(403);
  });
});