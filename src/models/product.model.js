import {
	MAX_MARGIN_PERCENT,
	MIN_MARGIN_PERCENT,
} from "../constants/pricing.constants.js";
import mongoose from "../utils/mongoose.util.js";

const ProductSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
		},
		description: {
			type: String,
		},
		price: {
			type: Number,
			required: true,
		},
		stock: {
			type: Number,
			required: true,
		},
		// null = seller sets no minimum, no platform enforcement
		minOrderQuantity: {
			type: Number,
			default: null,
		},
		marginPercent: {
			type: Number,
			required: true,
			min: MIN_MARGIN_PERCENT,
			max: MAX_MARGIN_PERCENT,
		},
		// key into the exchange rate provider
		commodityCode: {
			type: String,
			required: true,
		},
		category: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "ProductCategory",
			required: true,
		},
		shop: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "Shop",
			required: true,
		},
		image: {
			type: String,
			default: "",
		},
		createdBy: {
			type: mongoose.Schema.Types.ObjectId,
			ref: "User",
		},
	},
	{
		timestamps: true,
	},
);

const ProductModel = mongoose.model("Product", ProductSchema);
export default ProductModel;
