import express from "express";
import { IsLoggedIn } from "../middlewares/auth.middleware.js";
import {
  CreateOrder,
  GetMyOrders,
  GetShopOrders,
  GetOrderDetails,
} from "../controllers/order.controller.js";

const OrderRoute = express.Router();

OrderRoute.post("/", IsLoggedIn, CreateOrder);
OrderRoute.get("/mine", IsLoggedIn, GetMyOrders);
OrderRoute.get("/shop/:shopId", IsLoggedIn, GetShopOrders);
OrderRoute.get("/:id", IsLoggedIn, GetOrderDetails);

export default OrderRoute;