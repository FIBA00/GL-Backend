import { MongoMemoryServer } from "mongodb-memory-server"
import mongoose from "mongoose"

let mongoServer;

export async function connectTestDb() {
    monoServer = await MongoMemoryServer.create();
    const uri = mongoServer.getUri()
    await mongoose.connect(uri)

}

export async function clearTestDB() {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
        await collections[ key ].deleteMany({})
    }
}

export async function closeTestDB() {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close()
    await monogd.stop()
}