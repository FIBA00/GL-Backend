import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'

let monogd;

beforeAll(async function connectDb() {
    monogd = await MongoMemoryServer.create();
    await mongoose.connect(monogd.getUri())
})

afterEach(async function deleteDb() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[ key ].deleteMany({})
    }
})

afterAll(async function disconnectDb() {
    await mongoose.disconnect()
    await monogd.stop()
})