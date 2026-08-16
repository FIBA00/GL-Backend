// src/services/exchangeRate/index.js
import redisClient from "../../configs/redis.config.js";
import { createPlaceholderExchangeRateProvider } from "./placeholderExchangeRate.provider.js";
import { createCachedExchangeRateProvider } from "./cachedExchangeRate.provider.js";

// single source of truth for "which provider does the app actually use" —
// swapping the placeholder for a real API later is a one-line change here,
// nowhere else in the codebase needs to know.
const baseProvider = createPlaceholderExchangeRateProvider();
export const exchangeRateProvider = createCachedExchangeRateProvider(baseProvider, redisClient);