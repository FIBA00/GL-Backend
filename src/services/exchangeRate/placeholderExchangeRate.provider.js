// src/services/exchangeRate/placeholderExchangeRate.provider.js
// Swap-in for prod once you find (or don't find) a real API. Returns a
// hardcoded rate per commodity so the platform is functional while you
// figure out sourcing. This is the ONLY file that changes when a real
// API is found — order.service.js never touches it directly.
const PLACEHOLDER_RATES = {
	coffee: 210,
	sesame: 95,
	// add commodities as needed
};

export function createPlaceholderExchangeRateProvider() {
	return {
		async getRate(commodityCode) {
			const rate = PLACEHOLDER_RATES[commodityCode];
			if (rate === undefined)
				throw new Error("Unknown commodity: " + commodityCode);
			return rate;
		},
	};
}
