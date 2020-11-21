// Loading environment variables
import * as dotenv from "dotenv";
dotenv.config({ path: ".env" });

import mongoose from "mongoose"
import * as fs from "fs"
import app from "./server"

const port = process.env.SERVER_PORT;

// Connecting to database
mongoose.connect((process.env.MONGODB_ADDRESS as string) + "/PhyRemDB", { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("> MongoDB connected…"))
    .catch((err: any) => console.log(err)) //err with any type... not nice :( Fix this later
//TODO If an error occurs a new connection should be attempted again

let db = mongoose.connection;
db.once('open', () => console.log('> Connected to the database'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Setup directories for file uploads
var userImages = process.env.USER_IMAGES;
var exercises = process.env.EXERCISES;
if(userImages)
    if(!fs.existsSync(userImages))
        fs.mkdirSync(userImages, {recursive: true});
if(exercises)
    if(!fs.existsSync(exercises))
        fs.mkdirSync(exercises, {recursive: true});

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