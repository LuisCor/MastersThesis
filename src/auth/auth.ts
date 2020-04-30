import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import { Strategy as JWTstrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import Patients, { PatientInterface } from "../schemas/PatientSchema";

//Create a passport middleware to handle user registration
passport.use('signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    // Forwards the request received on the root to the following function at the first argument
    passReqToCallback: true 
}, async (req, email, password, done) => {
    try {

        const patient = await Patients.create({
            
            email,
            password,
            name : req.body.name,
            role: req.body.role,
            birthDate: req.body.birthDate,
            address: req.body.address,
            identificationNum: req.body.identificationNum,
            fiscalNumber: req.body.fiscalNumber,
        
            job: req.body.job,
            gender: req.body.gender,
            phoneNumber: req.body.phoneNumber,
            healthSystem: req.body.healthSystem,
            healthSystemNum: req.body.healthSystemNum
        
        } as PatientInterface);

        delete patient.__v;
        delete patient.password;

        return done(null, patient);
    } catch (error) {
        done(error.message);
    }
}));

//Create a passport middleware to handle User login
passport.use('login', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        const patient = await Patients.findOne({ username });

        if (!patient)
            return done(null, false, { message: 'Patient not found' });

        const validate = await patient.isValidPassword(password);
        if (!validate)
            return done(null, false, { message: 'Wrong Password' });

        return done(null, patient, { message: 'Logged in Successfully' });

    } catch (error) {
        return done(error);
    }
}));


//This verifies that the token sent by the user is valid
//  Token is sent on the http header for "Bearer"
passport.use(new JWTstrategy(
    {
        secretOrKey: process.env.JWT_SECRET,
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken()
    }, async (token, done) => {
        try {
            //Pass the user details to the next middleware
            return done(null, token.user);
        } catch (error) {
            done(error);
        }
    }));