import UserRoute from "./user.routes.js";
import OrderRoute from "./orders.routes.js";
import ShopRoute from "./shops.routes.js";
import ShopCategoryRoute from "./shopCategory.routes.js";
import ProductCategoryRoute from "./productCategory.routes.js";
import ProductGraphQLRoute from "./product.graphql.routes.js"; // the file above

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
