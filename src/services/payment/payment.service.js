// A fake provider implementing the same interface as your real StripeProvider
function createFakePaymentProvider(shouldSucceed) {
	return {
		async charge(amount, meta) {
			return shouldSucceed
				? { success: true, transactionId: "fake_txn_1" }
				: { success: false };
		},
	};
}
