// Importing Dependencies
import express from "express";
import cors from "cors";
import bodyParser from "body-parser";
import logger from "morgan";
import passport from "passport";
import "./auth/auth";

// Server Initialization
const app = express();
app.use(cors());

app.use(passport.initialize());
app.use(passport.session());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(logger('dev'));

// Importing routes
import Users from './routes/users';
import Admin from './routes/admin';
import Physicians from "./routes/physicians";
import Patients from "./routes/patients";
import Appointments from "./routes/appointments";
import PatientEvals from "./routes/patientEvals";


//  Assigning Routes
app.use('/', Users);
app.use('/admin', Admin);
app.use('/physician', Physicians);
app.use('/patient', Patients);
app.use('/appointment', Appointments);
app.use('/patientEval', PatientEvals);

export default app;