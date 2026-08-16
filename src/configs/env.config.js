import dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

// FIX: import.meta.url has no CommonJS equivalent, so Babel can't transform
// it — this broke as soon as a test suite's require chain reached this file.
// __dirname is the CJS-native equivalent and Babel already provides it.
const rootDir = path.resolve(__dirname, "../..");

const envFile =
	process.env.NODE_ENV === "production"
		? path.join(rootDir, ".env.production")
		: path.join(rootDir, ".env.local");
dotenv.config({
	path: path.join(rootDir, ".env"),
});
console.log("NODE_ENV =", process.env.NODE_ENV);
dotenv.config({
	path: envFile,
	override: true,
});
