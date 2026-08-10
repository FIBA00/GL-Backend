import multer from "multer";
import fs from "fs";
import path from "path";
import crypto from "crypto";

const UPLOAD_ROOT = "uploads"; // relative to process.cwd() -> /app/uploads in the container

function ensureDir(subfolder) {
  const full = path.join(UPLOAD_ROOT, subfolder);
  fs.mkdirSync(full, { recursive: true });
  return full;
}

const imageFileFilter = (req, file, cb) => {
  const allowed = ["image/jpeg", "image/png", "image/webp", "image/gif"];
  if (!allowed.includes(file.mimetype)) {
    return cb(new Error("Only image files (jpeg, png, webp, gif) are allowed"));
  }
  cb(null, true);
};

function makeUploader(subfolder) {
  const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, ensureDir(subfolder)),
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname);
      cb(null, `${crypto.randomUUID()}${ext}`);
    },
  });

  return multer({
    storage,
    fileFilter: imageFileFilter,
    limits: { fileSize: 10 * 1024 * 1024 }, // 5MB
  });
}

export const userUpload = makeUploader("users");
export const shopUpload = makeUploader("shops");
export const productUpload = makeUploader("products");

// Turns a saved multer file into the public URL you store on the document.
export function publicPathFor(subfolder, file) {
  if (!file) return undefined;
  return `/uploads/${subfolder}/${file.filename}`;
}
