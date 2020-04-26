// Importing Dependencies
import express from "express";
import cors from "cors";
import mongoose from 'mongoose';
import bodyParser from "body-parser";
import logger from "morgan";
import passport from "passport";
import "./auth/auth"

// Server Initialization
const app = express();
app.use(cors())

// Connecting to database
mongoose.connect((process.env.MONGODB_ADDRESS as string) + "/PhyRemDB", { useNewUrlParser: true, useUnifiedTopology: true})
 .then(() => console.log("> MongoDB connected…"))
 .catch( (err:any) => console.log(err)) //err with any type... not nice :( Fix this later
    //TODO If an error occurs a new connection should be attempted again

let db = mongoose.connection;
db.once('open', () => console.log('> Connected to the database'));
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// Importing routes
import Users from './routes/users'

//  Assigning Routes
app.use('/users', Users);

export default app