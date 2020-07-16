// Importing Dependencies
import express from "express";
import fileUpload from "express-fileupload"
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
app.use(fileUpload())

// Importing routes
import Users from './routes/users';
import Admin from './routes/admin';
import Physicians from "./routes/physicians";
import Patients from "./routes/patients";
import Appointments from "./routes/appointments";
import PatientEvals from "./routes/patientEvals";
import PhysioEvals from "./routes/physioEvals";
import Exercises from "./routes/exercises";


//  Assigning Routes
app.use('/api/', Users);
app.use('/api/admin', Admin);
app.use('/api/physician', Physicians);
app.use('/api/patient', Patients);
app.use('/api/appointment', Appointments);
app.use('/api/patientEval', PatientEvals);
app.use('/api/physioEval', PhysioEvals);
app.use('/api/exercises', Exercises);

export default app;