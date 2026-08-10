import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";
// import { fileURLToPath } from "url";

import RegisterRoutes from "./routes/main.js";

// Get current directory path in ES modules
// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

const App = express();

// ---------- CORS ----------
App.use(
	cors({
		origin: (origin, callback) => callback(null, origin || "*"),
		credentials: true,
	}),
);
// ---------- Body parser ----------
App.use(express.json({ limit: "50mb" }));
App.use(express.urlencoded({ limit: "50mb", extended: true }));
App.use(morgan("common"));

// static files
App.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// frontend
// if (process.env.NODE_ENV === "production") {
//  // Serve static frontend bundle assets from /dist folder
//   App.use(express.static(path.join(__dirname, "dist")));

//   // Catch-all route to serve the SPA entry index.html cleanly
//   App.get("*", (req, res) => {
//     res.sendFile(path.join(__dirname, "dist", "index.html"));
//   });
// }
// routes
App.get("/health", (req, res) => res.status(200).json({ status: "ok" }));
RegisterRoutes(App);

export default App;
