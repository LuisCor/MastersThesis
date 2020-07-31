///////// User Routes
//  Here are the all the available functions related to User.
//  These functions are responsible for receiving and interpreting the incomming requests
//  and produce appropriate responses based on other system functions

import express, {Request, Response} from 'express';
import passport from "passport";
import jwt from "jsonwebtoken";
import { roleAuthorization } from "../auth/auth"
import PatientController from '../controllers/patient.ctl';
import { check, validationResult } from 'express-validator';
const router = express.Router();
const patients = new PatientController();


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
router.post("/", [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 5 }),
    check('name').escape(),
    check('role', 'role does not exist').exists().custom((value, { req }) => (value === "PATIENT")),
    check('birthDate').isISO8601(),
    check('gender').escape(),
    check('phoneNumber').isMobilePhone("pt-PT")
  ], (req: Request, res: Response, next: any) => {
  
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return res.status(422).json({ errors: errors.array() });
  
    passport.authenticate('signup', { session: false }, async (err, user, info) => {
      if (err) {
        return res.status(400).send({ message: err })
      }
      else
        return res.status(200).send(user)
    })(req, res, next);
  
});
  


/**
 * Get Patient information
 * 
 * @route Get /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.get("/profile", passport.authenticate('jwt', { session: false }), roleAuthorization(['PATIENT']), patients.getPatientInfo);

/**
 * Get Patient information
 * 
 * @route Get /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.post("/profile", passport.authenticate('jwt', { session: false }), roleAuthorization(['PATIENT']), patients.updateProfileInfo);


/**
 * Get Patient information
 * 
 * @route Get /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.get("/search",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    patients.getPatientByName
);

/**
 * Get Patient information
 * 
 * @route Get /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.get("/:patientID",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    patients.getPatientInfoByID
);


/**
 * Get Patient information
 * 
 * @route Get /
 * @param {UserInfo.model} point.body.required - The information of the new user
 * @group Users
 * @operationId Create a new User
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creation successful
 * @returns {string}  500 - Unexpected error
 */
router.get("/history/:patientID",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN', 'PATIENT']),
    patients.getPatientHistory
);




export default router;