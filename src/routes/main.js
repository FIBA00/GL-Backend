import UserRoute from "./user.route.js";
import OrderRoute from "./orders.routes.js";
import ShopRoute from "./shops.route.js";
import ShopCategoryRoute from "./shopCategory.route.js";
import ProductCategoryRoute from "./productCategory.route.js";
import ProductGraphQLRoute from "./product.graphql.route.js"; // the file above

import multer from "multer"

export default function RegisterRoutes(app) {
  console.log(`Registering routes: `);
  app.use("/api/user", UserRoute);
  app.use("/api/orders", OrderRoute);
  app.use("/api/shops", ShopRoute);
  app.use("/api/products", ProductGraphQLRoute);
  app.use("/api/shopCategory", ShopCategoryRoute);
  app.use("/api/productCategory", ProductCategoryRoute);
  app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError || err?.message?.includes("Only image files")) {
    return res.status(400).json({ success: false, message: err.message });
  }
  next(err);
});
}
