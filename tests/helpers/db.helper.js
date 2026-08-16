// tests/helpers/db.helper.js
import { MongoMemoryReplSet } from "mongodb-memory-server";
import mongoose from "mongoose";

let replSet;

export async function connectTestDB() {
  // FIX: single-node MongoMemoryServer can't run transactions — Mongo
  // requires a replica set for multi-document ACID transactions, even
  // a 1-node one. This is what makes session.withTransaction() work below.
  replSet = await MongoMemoryReplSet.create({ replSet: { count: 1 } });
  const uri = replSet.getUri();
  await mongoose.connect(uri);
}

export async function clearTestDB() {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
}

export async function closeTestDB() {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await replSet.stop();
}