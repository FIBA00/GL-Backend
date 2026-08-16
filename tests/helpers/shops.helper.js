import ShopCategoryModel from "../../src/models/shopCategory.model.js";
import ShopModel from "../../src/models/shop.model.js";

export async function createTestCategory(overrides) {
    const defaults = { name: "Category_" + Date.now() }
    const data = Object.assign({}, defaults, overrides)
    return await ShopCategoryModel.create(data)
}

export async function createTestShop(ownerId, overrides) {
    const category = (overrides && overrides.category) || (await createTestCategory())
    const defaults = {
        name: "Shop_" + Date.now(),
        contact: "0911000000",
        owner: ownerId
    }
    const data = Object.assign({}, defaults, overrides, { category })
    return await ShopModel.create(data)
}
