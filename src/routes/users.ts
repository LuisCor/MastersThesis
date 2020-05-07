///////// User Routes
//  Here are the all the available functions related to User.
//  These functions are responsible for receiving and interpreting the incomming requests
//  and produce appropriate responses based on other system functions

import express from 'express';
import passport from "passport";
import jwt from "jsonwebtoken";
import { roleAuthorization } from "../auth/auth"
import UserController from '../controllers/user.ctl';
import { UserInterface, UserLoginInterface } from '../schemas/UsersSchema';
const router = express.Router();
const users = new UserController();


/**
 * @typedef LoginInfo
 * @property {string} username
 * @property {string} password
 */

/**
 * @typedef UserInfo
 * @property {string} username
 * @property {string} password
 * @property {string} name
 * @property {string} role
 * @property {string} address
 * @property {string} email
 * @property {string} phone
 */

/**
 * Creates a new user in the system
 * 
 * @route POST /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.post("/", (req, res, next) => {
  
  passport.authenticate('signup', { session: false }, async (err, user, info) => {
    if (err) {
      return res.status(400).send({ message: err })
    }
    else
    return res.status(200).send(user)
  })(req, res, next);
  
});

/**
 * Creates a new user in the system
 * 
 * @route POST /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.post("/login", (req, res, next) => {

  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user)
        return res.status(400).send(info.message);

      // Custom callback, login func at auth.ts
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error)

        const body = {
          _id: user._id,
          role: user.role
        };

        const token = jwt.sign({
          user: body
        }, process.env.JWT_SECRET as string, { algorithm: 'HS384', expiresIn: '1h' });

        return res.status(200).json({ token });
      });
    } catch (error) {
      return next(error);
    }
  })(req, res, next);

});

/**
 * Creates a new user in the system
 * 
 * @route POST /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.get("/recoverPassword", users.recoverPassword)

/**
 * Creates a new user in the system
 * 
 * @route POST /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.post("/resetPassword/:role/:token", users.resetPassword)

export default router;