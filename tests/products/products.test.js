import request from 'supertest'
import app from '../../app.js'
import ProductModel from '../../src/models/product.model.js'
import { reset } from 'supertest/lib/cookies.js'

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
