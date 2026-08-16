import express from "express";
const ProductCategoryRoute = express.Router();
import { IsLoggedIn } from "../middlewares/auth.middleware.js";

import {
  CreateProductCategory,
  GetAllProductCategories,
} from "../controllers/productCategory.controller.js";

ProductCategoryRoute.get("/", GetAllProductCategories);
ProductCategoryRoute.post("/", IsLoggedIn, CreateProductCategory);

export default ProductCategoryRoute;
