import "./src/configs/env.config.js";
import App from "./src/app.js";
import StartDatabase from "./src/configs/database.config.js";

const PORT = process.env.PORT || 9000;

async function StartServer() {
	try {
		await StartDatabase();
		App.listen(PORT, () => {
			console.log(`Server is running on port ${PORT}`);
		});
	} catch (error) {
		console.error("Error starting server: ", error.message);
	}
}

StartServer();
