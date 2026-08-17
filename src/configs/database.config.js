import "./env.config.js";
import mongoose from "../utils/mongoose.util.js";

const DB_URL = process.env.DB_URI;

export default async function StartDatabase() {
    try {
        console.log("Connecting to:", DB_URL);

        await mongoose.connect(DB_URL, {
            serverSelectionTimeoutMS: 5000,
        });

        console.log("MongoDB connected");
    } catch (error) {
        console.error(`Error while starting database: ${error.message}`);
        throw error;
    }
}

export { DB_URL };
