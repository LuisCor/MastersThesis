///////// User Routes
//  Here are the all the available functions related to User.
//  These functions are responsible for receiving and interpreting the incomming requests
//  and produce appropriate responses based on other system functions

import express, { Request, Response } from 'express';
import passport from "passport";
import jwt from "jsonwebtoken";
import { roleAuthorization } from "../auth/auth"
import UserController from '../controllers/user.ctl';
import { check, validationResult, param } from 'express-validator';
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
router.post("/login", [
  check('email').normalizeEmail().isEmail(),
  check('password').isLength({ min: 5 })
], (req: Request, res: Response, next: any) => {

  const errors = validationResult(req);
  if (!errors.isEmpty())
    return res.status(422).json({ errors: errors.array() });


  passport.authenticate('login', async (err, user, info) => {
    try {
      if (err || !user)
        return res.status(400).send(info.message);

      // Custom callback, login func at auth.ts
      req.login(user, { session: false }, async (error) => {
        if (error) return next(error)


        let body = {
          _id: user._id,
          role: user.role,
        } as any;
        if(body.role == "PHYSICIAN")
          body = {...body, specialty : user.specialty}

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
router.post("/resetPassword/:role/:token", [
  param('role', 'role does not exist').exists().custom((value, { req }) => (value === "PATIENT" || value === "PHYSICIAN")),
  param('token').escape()
], users.resetPassword)

export default router;