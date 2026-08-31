/** Guzolink media upload route: authenticated merchant image bytes are stored in S3 while product/shop records retain only their returned URLs. */
import type { Express, Request } from "express";
import multer from "multer";
import path from "path";
import { storagePut } from "./storage";
import { sdk } from "./_core/sdk";
import { sanitizeMediaContext } from "./mediaContext";

const maxBytes = 5 * 1024 * 1024;
const imageMimeTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif"]);
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: maxBytes, files: 1 }, fileFilter: (_req, file, callback) => callback(null, imageMimeTypes.has(file.mimetype)) });

function extensionFor(file: Express.Multer.File) {
  const fromName = path.extname(file.originalname).toLowerCase();
  return [".jpg", ".jpeg", ".png", ".webp", ".gif"].includes(fromName) ? fromName : ".jpg";
}

export function registerMerchantMediaRoutes(app: Express) {
  app.post("/api/media/upload", upload.single("file"), async (req, res) => {
    try {
      const user = await sdk.authenticateRequest(req as Request);
      const file = req.file;
      if (!file) return res.status(400).json({ message: "Choose one PNG, JPG, WEBP, or GIF image smaller than 5 MB." });
      if (!imageMimeTypes.has(file.mimetype)) return res.status(415).json({ message: "Unsupported image type." });
      const context = sanitizeMediaContext(req.body?.context);
      const safeName = `${Date.now()}-${crypto.randomUUID().slice(0, 8)}${extensionFor(file)}`;
      const stored = await storagePut(`merchant-media/${user.openId}/${context}/${safeName}`, file.buffer, file.mimetype);
      return res.status(201).json({ data: { key: stored.key, url: stored.url, context } });
    } catch (error) {
      console.error("[MerchantMedia] Upload failed", error);
      return res.status(401).json({ message: "Sign in is required before uploading merchant media." });
    }
  });
}
