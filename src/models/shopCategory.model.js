import mongoose from "../utils/mongoose.util.js";

// only shop category
// clothes, shoes, vegetables, supermarket, jewelry, electronics, furniture, books, toys, sports, health, beauty, automotive, music, art, travel, food, drinks, pets, home decor, gifts, services

const ShopCategorySchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			unique: true,
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

const ShopCategoryModel = mongoose.model("ShopCategory", ShopCategorySchema);
export default ShopCategoryModel;
