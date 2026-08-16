import ProductCategoryModel from "../../src/models/productCategory.model.js";
import ProductModel from "../../src/models/product.model.js";

export async function createTestProductCategory(overrides) {
	const defaults = { name: "ProductCategory_" + Date.now() };
	const data = Object.assign({}, defaults, overrides);
	return await ProductCategoryModel.create(data);
}

export async function createTestProduct(shopId, overrides) {
	const category =
		(overrides && overrides.category) ||
		(await createTestProductCategory())._id;

	const defaults = {
		name: "Product_" + Date.now(),
		price: 100,
		stock: 50,
		marginPercent: 10,
		commodityCode: "coffee",
	};

	const data = Object.assign({}, defaults, overrides, {
		shop: shopId,
		category,
	});
	return await ProductModel.create(data);
}
