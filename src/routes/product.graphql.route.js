import express from "express";
import { ProductRoute } from "../graphql/index.js";
import { ruruHTML } from "ruru/server";
import { IsLoggedIn } from "../middlewares/auth.middleware.js";
import {
  productUpload,
  publicPathFor,
} from "../middlewares/upload.middleware.js";

const router = express.Router();

// Dev-only interactive explorer, GET only
if (process.env.NODE_ENV !== "production") {
  router.get("/", (req, res) => {
    res.type("html").send(ruruHTML({ endpoint: "/api/products" }));
  });
}

// Actual GraphQL execution — POST only, all environments, no auth gate here.
// Auth is optional and handled per-field inside index.js's context() and
// enforced per-mutation inside product.resolver.js (createProduct/updateProduct/
// deleteProduct all throw if !user). Anonymous clients can still run queries.
router.post("/", ProductRoute);

router.post(
  "/upload-image",
  IsLoggedIn,
  productUpload.single("image"),
  (req, res) => {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });
    }
    return res
      .status(200)
      .json({ success: true, imageUrl: publicPathFor("products", req.file) });
  },
);

export default router;