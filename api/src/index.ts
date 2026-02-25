import {env} from "./config/env";
import app from "./app";

const startServer = async () => {
	try {
		app.listen(env.PORT, () => {
			console.log(`[Server] API Gateway is running on port ${env.PORT}`);
		});
	} catch (error) {
		console.error("[Server] Failed to start server:", error);
		process.exit(1);
	}
};

startServer();
