// Loading environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import app from "./server"

const port = process.env.SERVER_PORT;

// Initialize the Express Server
const server = app.listen(port, () => {
    console.log("> Server started at http://localhost:" + port);
});


// Setting up Swagger to generate OpenAPI Documentation
//  Options are loaded from an external json
// TODO: fix these requires as TS imports
const expressSwagger = require('express-swagger-generator')(app)
const options = require('../swagger-options.json')
expressSwagger(options)

export default server