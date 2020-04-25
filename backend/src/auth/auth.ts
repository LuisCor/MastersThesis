import passport from "passport";
import {Strategy as LocalStrategy} from "passport-local";
import Users, { UserInterface } from "../schemas/UsersSchema";
import { Strategy as JWTstrategy } from "passport-jwt";
import { ExtractJwt } from "passport-jwt";

//Create a passport middleware to handle user registration
passport.use('signup', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
}, async (req, username, password, done) => {
    try {
        const user = await Users.create({
            username,
            password,
            name : req.body.name,
            role : req.body.role,
            address : req.body.address,
            email : req.body.email,
            phone : req.body.phone
        } as UserInterface);
        console.log("--> DEBUG: Creating user: ", user)
        return done(null, user);
    } catch (error) {
        done(error);
    }
}));

//Create a passport middleware to handle User login
passport.use('login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password'
}, async (username, password, done) => {
    try {
        const user = await Users.findOne({ username });

        if (!user)
            return done(null, false, { message: 'User not found' });

        const validate = await user.isValidPassword(password);
        if (!validate)
            return done(null, false, { message: 'Wrong Password' });

        return done(null, user, { message: 'Logged in Successfully' });

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