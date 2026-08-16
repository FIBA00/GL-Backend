// src/services/order.service.js
import mongoose from "mongoose";
import ProductModel from "../models/product.model.js";
import ShopModel from "../models/shop.model.js";
import OrdersModel from "../models/orders.model.js";
import {
	MIN_MARGIN_PERCENT,
	MAX_MARGIN_PERCENT,
} from "../constants/pricing.constants.js";

export async function CalculateUnitPrice(product, exchangeRateProvider) {
	if (
		product.marginPercent < MIN_MARGIN_PERCENT ||
		product.marginPercent > MAX_MARGIN_PERCENT
	) {
		throw new Error("Margin percent out of allowed range");
	}
	const baseRate = await exchangeRateProvider.getRate(product.commodityCode);
	const rawPrice = baseRate * (1 + product.marginPercent / 100);
	return Math.round(rawPrice * 100) / 100;
}

export function ValidateOrderQuantity(product, quantity) {
	if (
		product.minOrderQuantity != null &&
		quantity < product.minOrderQuantity
	) {
		return {
			valid: false,
			reason: "Below seller's minimum order quantity",
		};
	}
	return { valid: true };
}

// session is required here (not optional like the standalone ReserveStock
// might be elsewhere) — every call site in PlaceOrder must participate in
// the same transaction so a later failure can roll every reservation back.
export async function ReserveStock(productId, quantity, session) {
	const updated = await ProductModel.findOneAndUpdate(
		{ _id: productId, stock: { $gte: quantity } },
		{ $inc: { stock: -quantity } },
		{ returnDocument: "after", session },
	);
	return updated
		? { success: true, product: updated }
		: { success: false, reason: "Insufficient stock" };
}

export async function PlaceOrder(
	buyerId,
	shopId,
	lineItems,
	exchangeRateProvider,
) {
	const shop = await ShopModel.findById(shopId);
	if (!shop) {
		throw new Error("Shop not found");
	}

	// FIX/rule from this conversation: merchants cannot order from their own shop
	if (shop.owner.toString() === buyerId.toString()) {
		throw new Error("Cannot place an order on your own shop");
	}

	const session = await mongoose.startSession();
	let createdOrder;

	try {
		await session.withTransaction(async function runOrderTransaction() {
			const orderProducts = [];
			let totalPrice = 0;

			for (const item of lineItems) {
				// .session(session) on the read ensures we see a consistent
				// snapshot within the transaction, not a stale pre-transaction read
				const product = await ProductModel.findById(
					item.productId,
				).session(session);
				if (!product) {
					throw new Error("Product not found: " + item.productId);
				}
				if (product.shop.toString() !== shopId.toString()) {
					throw new Error(
						"Product does not belong to the specified shop",
					);
				}

				const quantityCheck = ValidateOrderQuantity(
					product,
					item.quantity,
				);
				if (!quantityCheck.valid) {
					throw new Error(quantityCheck.reason);
				}

				const unitPrice = await CalculateUnitPrice(
					product,
					exchangeRateProvider,
				);

				const reservation = await ReserveStock(
					item.productId,
					item.quantity,
					session,
				);
				if (!reservation.success) {
					// throwing inside withTransaction's callback triggers an
					// automatic abort — every ReserveStock call so far in this loop
					// gets rolled back, no manual reversal code needed.
					throw new Error(reservation.reason);
				}

				orderProducts.push({
					product: item.productId,
					quantity: item.quantity,
					unitPrice,
					exchangeRateUsed: unitPrice, // TODO: separate raw rate from marked-up price if you need to audit margin independently later
				});
				totalPrice += unitPrice * item.quantity;
			}

			const [order] = await OrdersModel.create(
				[
					{
						buyer: buyerId,
						shop: shopId,
						products: orderProducts,
						totalPrice: Math.round(totalPrice * 100) / 100,
					},
				],
				{ session },
			);
			createdOrder = order;
		});
	} finally {
		await session.endSession();
	}

	return createdOrder;
}
