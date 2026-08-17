import Shop from "../models/shop.model.js";
import ShopCategory from "../models/shopCategory.model.js";
import { publicPathFor } from "../middlewares/upload.middleware.js";
import {getCachedShopListing} from "../services/cache/shopListing.cache.js"
import redisClient from "../configs/redis.config.js"

export async function GetAllShops(req, res) {
	try {
		// GET /shops/all?page=1&limit=10
		const page = parseInt(req.query.page) || 1;
		const limit = parseInt(req.query.limit) || 10;
		const category = req.query.category;

		const result = await getCachedShopListing(
			{ page, limit, category },
			redisClient,
		);

		
		return res.status(200).json({
			success: true,
			message:
				result.shops.length === 0
					? "No shops found"
					: "Shops retrieved successfully",
			data: result.shops,
			pagination: result.pagination,
		});
	} catch (error) {
		console.error("Error getting shops:", error);
		return res.status(500).json({ success: false, message: error.message });
	}
}


export async function GetMerchantShops(req, res) {
	try {
		const userid = req.user.id;
		const shops = await Shop.find({ owner: userid }).populate(
			"category",
			"name",
		);
		return res.status(200).json({
			success: true,
			message:
				shops.length === 0
					? "No shops found for this user"
					: "Shops retrieved successfully",
			shops,
		});
	} catch (error) {
		console.log("error occurred while getting all categories", error);
		return res.status(404).json({
			success: false,
			message: error.message,
		});
	}
}


export async function GetMerchantShopDetails(req, res) {
	try {
		const { id } = req.params;
		const existingShop = await Shop.findOne({ _id: id }).populate(
			"category",
			"name",
		);

		if (!existingShop) {
			return res.status(400).json({
				success: false,
				message: "Shop not found with given id ",
			});
		}

		return res.status(200).json({
			success: true,
			message: "Shop detials retrieved successfully",
			shop: existingShop,
		});
	} catch (error) {
		console.log("error occurred while getting all categories", error);
		return res.status(404).json({
			success: false,
			message: error.message,
		});
	}
}

export async function CreateMerchantShop(req, res) {
	try {
		const owner = req.user.id;
		const { name, contact } = req.body;
		const { category, description, location } = req.body;
		const posterImage = req.file
			? publicPathFor("shops", req.file)
			: undefined;

		console.log(posterImage, "posterImage path for shop creation");
		if (!name || !contact || !category) {
			return res
				.status(400)
				.json({ success: false, message: "All fields are required" });
		}

		const existingShop = await Shop.findOne({ name });
		if (existingShop) {
			return res.status(400).json({
				success: false,
				message: "Shop with this name already exists",
			});
		}

		const categoryExists = await ShopCategory.findById(category);
		if (!categoryExists) {
			return res
				.status(400)
				.json({ success: false, message: "Invalid category" });
		}

		const shop = await Shop.create({
			name,
			contact,
			owner,
			location,
			category,
			...(posterImage ? { posterImage } : {}),
			...(description ? { description } : {}),
			...(location ? { location } : {}),
		});

		return res.status(201).json({
			success: true,
			message: "Shop created successfully",
			shop,
		});
	} catch (error) {
		console.log("error occurred while creating shop: ", error);
		res.status(500).json({ message: error.message });
	}
}


export async function DeleteMerchantShop(req, res) {
	try {
		const { id, role } = req.user;
		const { id: shopId } = req.params;

		// find the shop first
		const shop = await Shop.findById(shopId);
		if (!shop) {
			return res.status(404).json({
				success: false,
				message: "No shop found for this user please add new shop",
				shop: [],
			});
		}

		// check ownership

		const isShopOwner = shop.owner?.toString() === id;
		if (!isShopOwner && role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "You are not authorized to delete this shop.",
			});
		}
		await Shop.findOneAndDelete({
			_id: shopId,
		});
		return res
			.status(200)
			.json({ success: true, message: "Shops deleted successfully" });
	} catch (error) {
		console.log("error occurred while getting all categories", error);
		return res.status(500).json({
			success: false,
			message: error,
		});
	}
}

export async function UpdateMerchantShop(req, res) {
	try {
		const { id, role } = req.user;
		const { id: shopId } = req.params; // route is "/:id", not "/:shopId"
		const { name, description, location, contact, category } = req.body;
		const posterImage = req.file
			? publicPathFor("shops", req.file)
			: undefined;
		const shop = await Shop.findById(shopId);

		if (!shop) {
			return res.status(404).json({
				success: false,
				message: "No shop found with this id",
				shop: [],
			});
		}

		const isShopOwner = shop.owner?.toString() === id;

		if (!isShopOwner && role !== "admin") {
			return res.status(403).json({
				success: false,
				message: "You are not authorized to update this shop.",
			});
		}

		// FIX: only set fields actually present in the request body, instead
		// of building the update object from possibly-undefined destructured
		// values. Previously relied on the MongoDB driver silently stripping
		// undefined keys — now explicit, so partial updates are guaranteed
		// not to touch fields the client didn't send.
		const update = {};
		if (name !== undefined) update.name = name;
		if (description !== undefined) update.description = description;
		if (location !== undefined) update.location = location;
		if (contact !== undefined) update.contact = contact;
		if (category !== undefined) update.category = category;
		if (posterImage !== undefined) update.posterImage = posterImage;

		const updatedShop = await Shop.findOneAndUpdate(
			{ _id: shopId },
			update,
			{
				returnDocument: "after",
			},
		);

		return res.status(200).json({
			success: true,
			message: "Shop updated successfully",
			shop: updatedShop,
		});
	} catch (error) {
		console.log("error occurred while updating merchant shop", error);
		return res.status(500).json({
			success: false,
			message: "error occurred while updating merchant shop",
		});
	}
}
