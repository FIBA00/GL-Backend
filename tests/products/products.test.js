import request from 'supertest'
import app from '../../app.js'
import ProductModel from '../../src/models/product.model.js'
import { reset } from 'supertest/lib/cookies.js'


import request from "supertest";
import App from "../../app.js";
import {
    connectTestDb,
    clearTestDB,
    closeTestDB,
} from "../helpers/db.helper.js";
import { createTestUser, authHeaderFor } from "../helpers/auth.helper";

beforeAll(async function setupDatabase() {
    await connectTestDb();
});

afterEach(async function resetDatabase() {
    await clearTestDB();
});

afterAll(async function teardownDatabase() {
    await closeTestDB();
});



describe('Get /api/products', function getProducts() {
    it('returns empty array when no products exits', async function returnProducts() {
        const res = await request(app).get("/api/producs")
        expect(res.status).toBe(200);
        expect(res.body).toEqual([])
    })

    it('returns seeded products', async function seededProducts() {
        await Product.create({
            name: 'Test item',
            price: 100
        })
        const res = await request(app).get('/api/products')
        expect(res.status).toBe(200);
        expect(res.body).toHaveLength(1);
    })
})
