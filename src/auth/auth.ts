import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Strategy as JWTstrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";
import Patients, { PatientInterface } from "../schemas/PatientSchema";
import Physicians, { PhysicianInterface } from "../schemas/PhysicianSchema";
import PhysicianController from "src/controllers/physician.ctl";

//Create a passport middleware to handle user registration
passport.use('signup', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password',
    passReqToCallback: true // Forwards the request received on the root to the following function at the first argument
}, async (req, email, password, done) => {
    try {


        if (req.body.role === "PATIENT") {

            const patient = await Patients.create({

                email,
                password,
                name: req.body.name,
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

            return done(null, { id: patient._id, email: patient.email });

        } else if (req.body.role === "PHYSICIAN") {
            const patient = await Physicians.create({

                email,
                password,
                name: req.body.name,
                role: "PHYSICIAN",
                gender: req.body.gender,
                birthDate: req.body.birthDate,
                physicianID: req.body.physicianID,
                phoneNumber: req.body.phoneNumber

            } as PhysicianInterface);

            return done(null, { id: patient._id, email: patient.email });

        }

    } catch (error) {
        if (error.code == 11000)
            return done({ error: "User already registered" });
        else
            return done(error)
    }
}));

//Create a passport middleware to handle User login
passport.use('physicianLogin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        const patient = await Physicians.findOne({ email: username });

        if (!patient)
            return done(null, false, { message: 'Physician not found' });

        const validate = await patient.isValidPassword(password);
        if (!validate)
            return done(null, false, { message: 'Wrong Password' });

        return done(null, patient, { message: 'Logged in Successfully' });

    } catch (error) {
        return done(error);
    }
}));


//Create a passport middleware to handle User login
passport.use('patientLogin', new LocalStrategy({
    usernameField: 'email',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        const patient = await Patients.findOne({ email: username });

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


//Middleware that verifies if the user issuing a request is allowed to proceed
// based on the array of roles authorized
export function roleAuthorization(roles: Array<String>) {
    return function (req: any, res: any, next: any) {
        //Request at this point comes from passport.authenticate so it's the object
        // "user" : {_id:--, role: --}
        let user = req.user;

        if (!user.role)
            return res.status(401).send({ error: "Role not provided" })

        const verification = (err: any, foundUser: any) => {
            if (err) {
                res.status(422).send({ error: "User not found" });
                return next(err);
            }

            if (roles.indexOf(foundUser.role) > -1)
                return next();

            res.status(401).send({ error: "Not Authorized to view content" })
            return next("Unauthorized");

        }


        //Here we run into a bit of a pickle, here's the thing: this will be executed pretty much
        // every time a route is called right? Cool. Confirming the user role against the database
        // every time is gonna cost a shit load of resources, so we will trust the token info (since we should)
        // for patients and physicians, but since admins have significant costs if compromised, they will always
        // be checked against the DB
        switch (user.role) {
            case "ADMIN":
                //TODO setup admin model
                //Admins.findById(user._id, verification);
                verification({ err: "error" }, null)
                console.log("--> TRIGGERED ADMIN")
                break;
            case "PHYSICIAN":
                if (roles.indexOf("PHYSICIAN") > -1)
                    return next();
                else
                    return res.status(401).send({ error: "Not Authorized to view content" })
                break;
            case "PATIENT":
                if (roles.indexOf("PATIENT") > -1)
                    return next();
                else
                    return res.status(401).send({ error: "Not Authorized to view content" })
                break;
            default:
                res.status(401).send({ error: "Not Authorized to view content" })
                break;

        }

    }
}
