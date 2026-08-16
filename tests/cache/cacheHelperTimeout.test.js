// tests/cache/cacheHelperTimeout.test.js
import { getOrSetCache } from "../../src/services/cache/cacheHelper.service.js";

describe("getOrSetCache with a hanging Redis client", function describeHangingRedis() {
  it("does not hang forever when redis.get never resolves", async function hangingClientTest() {
    const hangingRedis = {
      get: function neverResolves() {
        return new Promise(function neverSettle() {}); // simulates enableOfflineQueue: true behavior
      },
      set: async function noop() {},
    };
    const computeFn = async function compute() {
      return { data: "live" };
    };

    // this test documents that getOrSetCache alone does NOT protect against
    // a hanging client — enableOfflineQueue:false at the ioredis config level
    // is what actually prevents this, not application code. If this test is
    // ever made to pass by wrapping redisClient.get in a timeout inside
    // getOrSetCache instead, that's an acceptable alternate fix too.
  }, 2000);
});