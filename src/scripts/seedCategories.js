import mongoose from "../utils/mongoose.util.js";
import UserModel from "../models/user.model.js";
import ShopCategory from "../models/shopCategory.model.js";
import ProductCategory from "../models/productCategory.model.js";
import { DB_URL } from "../configs/database.config.js";

try {
  await mongoose.connect(DB_URL);
  console.log("Connected to database for seeding categories");
} catch (error) {
  console.error(`Error connecting to database: ${error.message}`);
  process.exit(1);
}

try {
  // Find an admin or any user to assign createdBy
  const adminUser = await UserModel.findOne({ role: "admin" }) || await UserModel.findOne();
  const createdBy = adminUser ? adminUser._id : null;

  const defaultShopCategories = [
    "Clothing", "Shoes", "Supermarket", "Jewelry", "Electronics", 
    "Furniture", "Books", "Toys", "Sports", "Health & Beauty"
  ];

  const defaultProductCategories = [
    "Clothing", "Men", "Women", "Kids", "Accessories", 
    "Electronics", "Home & Kitchen", "Books", "Toys", "Jewelry"
  ];

  console.log("Seeding Shop Categories...");
  for (const name of defaultShopCategories) {
    const exists = await ShopCategory.findOne({ name });
    if (!exists) {
      await ShopCategory.create({ name, createdBy });
      console.log(`Created shop category: ${name}`);
    } else {
      console.log(`Shop category already exists: ${name}`);
    }
  }

  console.log("Seeding Product Categories...");
  for (const name of defaultProductCategories) {
    const exists = await ProductCategory.findOne({ name });
    if (!exists) {
      await ProductCategory.create({ name, createdBy });
      console.log(`Created product category: ${name}`);
    } else {
      console.log(`Product category already exists: ${name}`);
    }
  }

  console.log("Seeding completed successfully!");
} catch (error) {
  console.error(`Seeding failed: ${error.message}`);
} finally {
  process.exit();
}
