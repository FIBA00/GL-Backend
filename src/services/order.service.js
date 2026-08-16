import {
	MIN_MARGIN_PERCENT,
	MAX_MARGIN_PERCENT,
} from "../constants/pricing.constants.js";
import ProductModel from "../models/product.model.js";

export async function CalculateUnitPrice(product, exchangeRateProvider) {
	if (
		product.marginPercent < MIN_MARGIN_PERCENT ||
		product.marginPercent > MAX_MARGIN_PERCENT
	) {
		throw new Error("Margin perceent out of allowed range");
	}
	const baseRate = await exchangeRateProvider.getRate(product.commodityCode);
	let unitPrice = baseRate * (1 + product.marginPercent / 100);
	return unitPrice;
}

export async function ReserveStock(productId, quantity) {
	const updated = await ProductModel.findOneAndUpdate(
		{ _id: productId, stock: { $gte: quantity } }, // filter — closed here
		{ $inc: { stock: -quantity } }, // update
		{ returnDocument: "after" }, // options
	);
	return updated
		? { success: true, product: updated }
		: { success: false, reason: "Insufficient stock" };
}

export function ValidateOrderQuantity(product, quantity) {
	if (
		product.minOrderQuantity != null &&
		quantity < product.minOrderQuantity
	) {
		return {
			valid: false,
			reason: "Below seller's minimum order quantity !",
		};
	}
	return {
		valid: true,
	};
}
