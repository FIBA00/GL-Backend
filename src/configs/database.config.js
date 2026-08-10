import "./env.config.js";
import mongoose from "../utils/mongoose.util.js";


const DB_URL = process.env.DB_URI
	
export default async function StartDatabase() {
	try {
		console.log("Connecting to:", DB_URL);
		await mongoose.connect(DB_URL);
	} catch (error) {
		console.log(`Error while startin database ${error.message}`);
	}
}

export { DB_URL };
