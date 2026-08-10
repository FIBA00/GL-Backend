import express from  "express"
const ShopCategoryRoute = express.Router()
import { IsLoggedIn} from "../middlewares/auth.middleware.js"

import { CreateShopCategory, GetAllShopCategories } from "../controllers/shopCategory.controller.js"



ShopCategoryRoute.get("/", IsLoggedIn, GetAllShopCategories)
ShopCategoryRoute.post("/", IsLoggedIn,  CreateShopCategory)
// ShopCategoryRoute.post("/:id", IsLoggedIn, IsAdmin, UpdateShopCategory)
// ShopCategoryRoute.delete("/:id", IsLoggedIn, IsAdmin, DeleteShopCategory)


export default ShopCategoryRoute