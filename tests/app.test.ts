// Loading environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: "./tests/.env.test" });

import app from "../src/server"

const port = process.env.SERVER_PORT;

// Initialize the Express Server
const server = app.listen(port);

export default server;