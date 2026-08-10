import express from "express";
import {
  createOrder,
  getAllOrders,
  deleteOrder
} from "../controllers/order.controller.js";
import { IsLoggedIn } from "../middlewares/auth.middleware.js";


const orderRouter = express.Router();

orderRouter.post("/", IsLoggedIn, createOrder);
orderRouter.get("/", IsLoggedIn, getAllOrders);
orderRouter.delete("/:id", IsLoggedIn, deleteOrder);

export default orderRouter;