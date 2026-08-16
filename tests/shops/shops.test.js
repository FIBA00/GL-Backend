import request from "supertest";
import App from "../../app.js";
;
import { connectTestDB, clearTestDB, closeTestDB } from "../helpers/db.helper.js";
import { createTestUser, authHeaderFor } from "../helpers/auth.helper.js";
import { createTestCategory, createTestShop } from "../helpers/shops.helper.js";

beforeAll(async function setupDatabase() {
    await connectTestDB();
});

afterEach(async function resetDatabase() {
    await clearTestDB();
});

afterAll(async function teardownDatabase() {
    await closeTestDB();
});

describe("POST /api/shops", function describeCreateShop()){
    it("creates a shop and returns 201 ",
        async function createShopSuccessTest() {
            const owner = await createTestUser();
            const category = await createTestCategory();

            const res = await request(App).post("/api/shops").set(authHeaderFor(owner)).send({
                name: "Test Shop", contact: "0911000000", category: category._id.toString()
            });

            expect(res.status).toBe(201);
            expect(res.body.shop.name).toBe("Test Shop");
        });
    
        it("rejects when required fields are missing", async function missingFieldsTest() {
            const owner = await createTestUser();
            const res = await request(App)
              .post("/api/shops")
              .set(authHeaderFor(owner))
              .send({ name: "No Contact Shop" });
            expect(res.status).toBe(400);
          });
        
          it("rejects a duplicate shop name", async function duplicateShopNameTest() {
            const owner = await createTestUser();
            const category = await createTestCategory();
            await createTestShop(owner._id, { name: "Taken Name", category: category._id });
        
            const res = await request(App)
              .post("/api/shops")
              .set(authHeaderFor(owner))
              .send({ name: "Taken Name", contact: "0911000000", category: category._id.toString() });
            expect(res.status).toBe(400);
          });
        
          it("rejects an invalid category id", async function invalidCategoryTest() {
            const owner = await createTestUser();
            const res = await request(App)
              .post("/api/shops")
              .set(authHeaderFor(owner))
              .send({ name: "Bad Category Shop", contact: "0911000000", category: "64f000000000000000000000" });
            expect(res.status).toBe(400);
          });
        });
        

describe("GET /api/shops (merchant's own shops)", function describeGetMerchantShops() {
          
    it("returns 200 with an empty array when the merchant has no shops (regression: was 404)", async function noShopsRegressionTest() {
            const owner = await createTestUser();
            const res = await request(App).get("/api/shops").set(authHeaderFor(owner));
            expect(res.status).toBe(200);
            expect(res.body.shops).toEqual([]);
          });
        
    it("returns only shops belonging to the requesting user", async function ownShopsOnlyTest() {
            const owner = await createTestUser();
            const otherOwner = await createTestUser();
            await createTestShop(owner._id, { name: "Mine" });
            await createTestShop(otherOwner._id, { name: "Not Mine" });
        
            const res = await request(App).get("/api/shops").set(authHeaderFor(owner));
            expect(res.status).toBe(200);
            expect(res.body.shops).toHaveLength(1);
            expect(res.body.shops[0].name).toBe("Mine");
          });
        });
        

describe("GET /api/shops/all (public, paginated)", function describeGetAllShops() {
          
    it("returns pagination metadata even with zero shops", async function emptyPaginationTest() {
            const res = await request(App).get("/api/shops/all");
            expect(res.status).toBe(200);
            expect(res.body.pagination.totalItems).toBe(0);
          });
        
    it("respects limit and page query params", async function paginationLimitTest() {
            const owner = await createTestUser();
            const category = await createTestCategory();
            await createTestShop(owner._id, { name: "Shop A", category: category._id });
            await createTestShop(owner._id, { name: "Shop B", category: category._id });
            await createTestShop(owner._id, { name: "Shop C", category: category._id });
        
            const res = await request(App).get("/api/shops/all?page=1&limit=2");
            expect(res.status).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.pagination.hasNextPage).toBe(true);
          });
        });
        

describe("PUT /api/shops/:id ownership", function describeUpdateShopOwnership() {
          it("allows the owner to update their shop", async function ownerUpdateTest() {
            const owner = await createTestUser();
            const shop = await createTestShop(owner._id);
        
            const res = await request(App)
              .put("/api/shops/" + shop._id)
              .set(authHeaderFor(owner))
              .send({ contact: "0922222222" });
            expect(res.status).toBe(200);
            expect(res.body.shop.contact).toBe("0922222222");
          });
        
          it("blocks a non-owner, non-admin from updating the shop", async function nonOwnerUpdateBlockedTest() {
            const owner = await createTestUser();
            const stranger = await createTestUser();
            const shop = await createTestShop(owner._id);
        
            const res = await request(App)
              .put("/api/shops/" + shop._id)
              .set(authHeaderFor(stranger))
              .send({ contact: "0933333333" });
            expect(res.status).toBe(403);
          });
        
          it("allows admin to update any shop", async function adminUpdateShopTest() {
            const owner = await createTestUser();
            const admin = await createTestUser({ role: "admin" });
            const shop = await createTestShop(owner._id);
        
            const res = await request(App)
              .put("/api/shops/" + shop._id)
              .set(authHeaderFor(admin))
              .send({ contact: "0944444444" });
            expect(res.status).toBe(200);
          });
        
          it("partial update does not clobber fields the client didn't send (regression)", async function partialUpdateNoClobberTest() {
            const owner = await createTestUser();
            const shop = await createTestShop(owner._id, {
              name: "Original Name",
              description: "Original description",
            });
        
            const res = await request(App)
              .put("/api/shops/" + shop._id)
              .set(authHeaderFor(owner))
              .send({ contact: "0955555555" }); // only contact sent
        
            expect(res.status).toBe(200);
            expect(res.body.shop.name).toBe("Original Name");
            expect(res.body.shop.description).toBe("Original description");
            expect(res.body.shop.contact).toBe("0955555555");
          });
        });
        

describe("DELETE /api/shops/:id ownership", function describeDeleteShopOwnership() {
          it("blocks a non-owner, non-admin from deleting the shop", async function nonOwnerDeleteBlockedTest() {
            const owner = await createTestUser();
            const stranger = await createTestUser();
            const shop = await createTestShop(owner._id);
        
            const res = await request(App)
              .delete("/api/shops/" + shop._id)
              .set(authHeaderFor(stranger));
            expect(res.status).toBe(403);
          });
        
          it("allows the owner to delete their own shop", async function ownerDeleteTest() {
            const owner = await createTestUser();
            const shop = await createTestShop(owner._id);
        
            const res = await request(App)
              .delete("/api/shops/" + shop._id)
              .set(authHeaderFor(owner));
            expect(res.status).toBe(200);
          });
        });