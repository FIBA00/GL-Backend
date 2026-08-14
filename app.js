import express from "express";
import cors from "cors";
import morgan from "morgan";
import path from "path";

// internal imports
import "./src/configs/env.config.js";
import StartDatabase from "./src/configs/database.config.js";
import RegisterRoutes from "./src/routes/main.js";


const App = express();
const PORT = process.env.PORT || 9000;

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


App.get("/health", (req, res) => res.status(200).json({ success: true, status: "ok" }));

// -----------------------------------------------------------------
RegisterRoutes(App);


export default App