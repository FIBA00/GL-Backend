import express from "express";
const ShopRoute = express.Router();
import { IsLoggedIn } from "../middlewares/auth.middleware.js";

import {
  CreateMerchantShop,
  GetMerchantShopDetails,
  GetMerchantShops,
  DeleteMerchantShop,
  UpdateMerchantShop,
  GetAllShops
} from "../controllers/shops.controller.js";

import {shopUpload} from "../middlewares/upload.middleware.js";

ShopRoute.get("/all", GetAllShops);
ShopRoute.get("/", IsLoggedIn, GetMerchantShops);
ShopRoute.get("/:id", IsLoggedIn, GetMerchantShopDetails);
ShopRoute.post("/", IsLoggedIn, shopUpload.single("posterImage"), CreateMerchantShop);
ShopRoute.put("/:id", IsLoggedIn, shopUpload.single("posterImage"), UpdateMerchantShop);
ShopRoute.delete("/:id", IsLoggedIn, DeleteMerchantShop);

export default ShopRoute;
