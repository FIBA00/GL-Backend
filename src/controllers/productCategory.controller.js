import ProductCategory from "../models/productCategory.model.js";

export async function CreateProductCategory(req, res) {
    try {
        const { name } = req.body;
        const userId = req.user.id;

        if (!name) {
            return res.status(400).json({ success: false, message: "Name is required" });
        }

        const category = await ProductCategory.create({
            name,
            createdBy: userId
        });

        return res.status(200).json({ success: true, message: "Product category created successfully", category });
    } catch (error) {
        console.log("Error occurred while creating product category: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}

export async function GetAllProductCategories(req, res) {
    try {
        const categories = await ProductCategory.find();

        if (!categories || categories.length === 0) {
            return res.status(404).json({ success: false, message: "No product categories found" });
        }

        return res.status(200).json({ success: true, message: "Product categories retrieved successfully", categories });
    } catch (error) {
        console.log("Error occurred while getting all product categories: ", error);
        return res.status(500).json({ success: false, message: error.message });
    }
}
