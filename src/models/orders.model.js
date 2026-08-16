import mongoose from "../utils/mongoose.util.js";

const orderProductSchema = new mongoose.Schema(
	{
		product: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Product",
			required: true,
		},
		quantity: { type: Number, required: true, min: 1 },
		// snapshot fields — copied from Product at order time, never re-read live.
		// this is what makes past orders immune to future price/rate changes.
		unitPrice: { type: Number, required: true },
		// ETB trade exchange value at time of order
		exchangeRateUsed: { type: Number, required: true },
	},
	{ _id: false },
);

const ordersSchema = new mongoose.Schema(
	{
		buyer: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
			required: true,
		},
		shop: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Shop",
			required: true,
		}, // the seller
		products: {
			type: [orderProductSchema],
			required: true,
			validate: {
				validator: function hasAtLeastOneProduct(arr) {
					return arr.length > 0;
				},
				message: "Order must contain at least one product",
			},
		},
		// sum of (unitPrice * quantity), computed once at creation
		totalPrice: { type: Number, required: true },

		fulfillmentStatus: {
			type: String,
			enum: [
				"pending",
				"processing",
				"shipped",
				"delivered",
				"cancelled",
			],
			default: "pending",
		},
		paymentStatus: {
			type: String,
			enum: ["unpaid", "paid", "refunded", "failed"],
			default: "unpaid",
		},

		// string, not an import — this is the swap point
		paymentProvider: { type: String, default: "stripe" },
		// provider's transaction/charge id, opaque to your business logic
		paymentReference: { type: String },
	},
	{ timestamps: true },
);
ordersSchema.index({ buyer: 1, createdAt: -1 }); // "my orders" list, newest first
ordersSchema.index({ shop: 1, createdAt: -1 }); // "orders for my shop" list
const OrdersModel = mongoose.model("Order", ordersSchema);
export default OrdersModel;
