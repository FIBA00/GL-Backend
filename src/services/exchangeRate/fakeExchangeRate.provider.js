// src/services/exchangeRate/fakeExchangeRate.provider.js
// Test/dev double. Deterministic, no network — this is what tests inject.
export function createFakeExchangeRateProvider(fixedRates) {
  return {
    async getRate(commodityCode) {
      if (fixedRates[commodityCode] === undefined) {
        throw new Error("No fake rate configured for commodity: " + commodityCode);
      }
      return fixedRates[commodityCode];
    },
  };
}