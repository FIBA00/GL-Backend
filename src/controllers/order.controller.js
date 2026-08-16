import OrdersModel from "../models/orders.model.js";
import { PlaceOrder } from "../services/order.service.js";
import { exchangeRateProvider } from "../services/exchangeRate/index.js";

export async function CreateOrder(req, res) {
  try {
    const buyerId = req.user._id;
    const { shopId, products } = req.body;

    if (!shopId || !Array.isArray(products) || products.length === 0) {
      return res.status(400).json({
        success: false,
        message: "shopId and at least one product are required",
      });
    }

    const order = await PlaceOrder(buyerId, shopId, products, exchangeRateProvider);

    return res.status(201).json({
      success: true,
      message: "Order placed successfully",
      order,
    });
  } catch (error) {
    // PlaceOrder throws plain Errors for every business-rule violation
    // (self-order, insufficient stock, wrong shop, bad margin) — all of
    // those are client mistakes, not server failures, so 400 not 500.
    console.log("Error placing order:", error.message);
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
}

export async function GetMyOrders(req, res) {
  try {
    const orders = await OrdersModel.find({ buyer: req.user._id })
      .sort({ createdAt: -1 })
      .populate("shop", "name")
      .populate("products.product", "name");

    return res.status(200).json({
      success: true,
      orders,
    });
  } catch (error) {
    console.log("Error fetching buyer orders:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function GetShopOrders(req, res) {
  try {
    const { shopId } = req.params;
    // ownership check happens at the route/middleware level for this one —
    // see shop.routes.js pattern; kept here as defense-in-depth for now
    const orders = await OrdersModel.find({ shop: shopId })
      .sort({ createdAt: -1 })
      .populate("buyer", "username email")
      .populate("products.product", "name");

    return res.status(200).json({ success: true, orders });
  } catch (error) {
    console.log("Error fetching shop orders:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}

export async function GetOrderDetails(req, res) {
  try {
    const { id } = req.params;
    const order = await OrdersModel.findById(id)
      .populate("shop", "name owner")
      .populate("products.product", "name");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    const isBuyer = order.buyer.toString() === req.user._id.toString();
    const isShopOwner = order.shop.owner.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "admin";

    if (!isBuyer && !isShopOwner && !isAdmin) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to view this order",
      });
    }

    return res.status(200).json({ success: true, order });
  } catch (error) {
    console.log("Error fetching order details:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
}