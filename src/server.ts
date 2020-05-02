// Importing Dependencies
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "morgan";
import passport from "passport";
import "./auth/auth"

// Server Initialization
const app = express();
app.use(cors())

app.use(passport.initialize())
app.use(passport.session())
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// Importing routes
import Users from './routes/users'
import Physicians from "./routes/physicians";

//  Assigning Routes
app.use('/user', Users);
app.use('/physician', Physicians)

export default app