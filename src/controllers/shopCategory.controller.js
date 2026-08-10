import ShopCategory from "../models/shopCategory.model.js";

export async function CreateShopCategory(req, res) {
    try {
        const { name, description } = req.body;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const category = await ShopCategory.create({
            name,
            description
        });

        return res.status(200).json({ success: true, message: "Shop category created successfully", category });
    } catch (error) {
        console.log("Error occurred while creating shop category: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function GetAllShopCategories(req, res) {
    try {
        const categories = await ShopCategory.find();

        if (!categories || categories.length === 0) {
            return res.status(404).json({ success: false, message: "No shop categories found" });
        }

        return res.status(200).json({ success: true, message: "Shop categories retrieved successfully", categories });
    } catch (error) {
        console.log("Error occurred while getting all shop categories: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}