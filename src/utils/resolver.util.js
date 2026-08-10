import CategoryModel from "../models/category.model.js";
import mongoose from "../utils/mongoose.util.js";

export async function ResolveCategory(categoryValue, userId) {
	if (!categoryValue) return null;

	// 1. Try to find by ID if it's a valid MongoDB ID
	if (mongoose.isValidObjectId(categoryValue)) {
		const category = await CategoryModel.findById(categoryValue);
		if (category) return category;
	}

	// 2. Find by name (case-insensitive)
	let category = await CategoryModel.findOne({
		name: new RegExp(`^${categoryValue}$`, "i"),
	});

	// 3. If not found, create it!
	if (!category && userId) {
		category = await CategoryModel.create({
			name: categoryValue,
			createdBy: userId,
		});
	}

	return category;
}
