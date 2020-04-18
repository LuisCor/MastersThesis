// Dependencies
import express from "express";
import cors from "cors";

// Initialization
const app = express();
app.use(cors())
const port = 8080; // default port to listen


// Importing routes
const users = require('./routes/users')

//  Assigning Routes
app.use('/users', users);


// start the express server
app.listen( port, () => {
    // tslint:disable-next-line:no-console
    console.log( `server started at http://localhost:${ port }` );
} );

const options = require('../swagger-options.json')

const expressSwagger = require('express-swagger-generator')(app)

expressSwagger(options)