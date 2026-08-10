import CategoryModel from "../models/shopCategory.model.js";

export async function CreateCategory(req, res) {
	try {
		const userId = req.user.id;
		const { name, title } = req.body;
		const categoryName = name || title;

		if (!categoryName) {
			console.log("error name field is required for category");
			return res.status(400).json({
				success: false,
				message: "name of the category is required.",
			});
		}

		const existing_category = await CategoryModel.findOne({
			name: categoryName,
		});
		if (existing_category) {
			return res.status(400).json({
				success: true,
				message: "Category already Exists",
			});
		}

		const book_category = await CategoryModel.create({
			name: categoryName,
			createdBy: userId,
		});

		const populatedBookCategory = await CategoryModel.findById(
			book_category._id,
		)
			.populate({
				path: "books",
				select: "name description publishdate posterImage category ",
				populate: {
					path: "category",
					select: "name",
				},
			})
			.populate("createdBy", "username");

		return res.status(201).json({
			success: true,
			message: "Category Created Successfully.",
			book_category: populatedBookCategory,
		});
	} catch (error) {
		console.log("Error occurred while creating book category; ", error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}

export async function GetAllCategories(req, res) {
	try {
		const categories = await CategoryModel.find();
		if (!categories) {
			return res.status(404).json({
				success: false,
				message: "No categories found !",
			});
		}
		return res.status(200).json({
			success: false,
			message: categories,
		});
	} catch (error) {
		console.log("Error occured while getting all categories: ", error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}

export async function UpdateCategory(req, res) {
	try {
		const { id } = req.params;
		const { name } = req.body;
		const category = await CategoryModel.findById(id);
		if (!category) {
			return res.status(404).json({
				success: false,
				message: "Category not found !",
			});
		}
		const update = {};
		if (name !== undefined) update.name = name;
		const UpdatedCategory = await CategoryModel.findByIdAndUpdate(
			id,
			update,
			{
				returnDocument: "after",
			},
		);
		return res.status(200).json({
			success: true,
			message: "Category updated successfully!",
			category: UpdatedCategory,
		});
	} catch (error) {
		console.log("Error occured while updating category: ", error);
		return res.status(500).json({
			success: false,
			message: error.message,
		});
	}
}
