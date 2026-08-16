import ShopModel from "../../models/shop.model.js";
import { getOrSetCache } from "./cacheHelper.service.js";

const SHOP_LISTING_TTL_SECONDS = 60;

export function buildShopListingCacheKey(params) {
	const page = params.page || 1;
	const limit = params.limit || 10;
	const category = params.category || "all";

	return (
		"shops:list:page=" + page + ":limit=" + limit + ":category=" + category
	);
}

export async function getCachedShopListing(params, redisClient) {
	const key = buildShopListingCacheKey(params);

	return await getOrSetCache(
		key,
		SHOP_LISTING_TTL_SECONDS,
		redisClient,
		async function computeShopListing() {
			const page = params.page || 1;
			const limit = params.limit || 10;
			const skip = (page - 1) * limit;
			const filter = params.category ? { category: params.category } : {};
			const totalShops = await ShopModel.countDocuments(filter);

			// database access
			const shops = await ShopModel.find(filter)
				.populate("category", "name")
				.sort({ createdAt: -1 })
				.skip(skip)
				.limit(limit);

			return {
				shops,
				pagination: {
					totalItems: totalShops,
					totalPages: Math.ceil(totalShops / limit),
					currentPage: page,
					pageSize: limit,
					hasNextPage: page * limit < totalShops,
					hasPreviousPage: page > 1,
				},
			};
		},
	);
}
