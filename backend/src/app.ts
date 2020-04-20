// Loading environment variables
import * as dotenv from "dotenv";
dotenv.config({path : ".env"});

// Importing Dependencies
import express from "express";
import cors from "cors";
import mongoose = require('mongoose')
import bodyParser from "body-parser";
import logger from "morgan";

// Server Initialization
const app = express();
app.use(cors())
const port = process.env.SERVER_PORT;

// Connecting to database
mongoose.connect((process.env.MONGODB_ADDRESS as string) + "/PhyRemDB", { useNewUrlParser: true, useUnifiedTopology: true})
 .then(() => console.log("> MongoDB connected…"))
 .catch( (err:any) => console.log(err)) //err with any type... not nice :( Fix this later
    //TODO If an error occurs a new connection should be attempted again

let db = mongoose.connection;
db.once('open', () => console.log('> Connected to the database'));
// checks if connection with the database is successful
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

// bodyParser, parses the request body to be a readable json format
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
// Server Requests Logging
app.use(logger('dev'));

// Importing routes
const users = require('./routes/users')

//  Assigning Routes
app.use('/users', users);

// Initialize the Express Server
app.listen( port, () => {
    console.log("> Server started at http://localhost:" + port);
} );


// Setting up Swagger to generate OpenAPI Documentation
//  Options are loaded from an external json
const expressSwagger = require('express-swagger-generator')(app)
const options = require('../swagger-options.json')
expressSwagger(options)
