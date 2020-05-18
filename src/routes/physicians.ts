///////// Physician Routes
//  Here are the all the available functions related to User.
//  These functions are responsible for receiving and interpreting the incomming requests
//  and produce appropriate responses based on other system functions

import express, {Request, Response} from 'express';
import passport from "passport";
import { param, check, validationResult } from "express-validator";

import { roleAuthorization } from "../auth/auth";
import PhysicianController from '../controllers/physician.ctl';

const router = express.Router();
const physicians = new PhysicianController();


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
    check('role', 'role does not exist').exists().custom((value, { req }) => (value === "PHYSICIAN")),
    check('birthDate').isISO8601(),
    check('gender').escape(),
    check('phoneNumber').isMobilePhone("pt-PT"),
    check('specialty').isArray({min: 1})
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
 * Lists all users registered in the system
 * 
 * @route GET /
 * @group Users - The actions and informations related to the system's users
 * @operationId List all Users
 * @produces application/json application/xml
 * @returns {UserInfo.model} 200 - List of registered users
 * @returns {string}  500 - Unexpected error
 */
router.post("/adopt/:patientID", [
    param('patientID').exists().escape()
],
    passport.authenticate("jwt", { session: false }),
    roleAuthorization(['PHYSICIAN']),
    physicians.adoptPatient
)


/**
 * Lists all users registered in the system
 * 
 * @route GET /
 * @group Users - The actions and informations related to the system's users
 * @operationId List all Users
 * @produces application/json application/xml
 * @returns {UserInfo.model} 200 - List of registered users
 * @returns {string}  500 - Unexpected error
 */
router.post("/drop/:patientID", [
    param('patientID').exists().escape()
],
    passport.authenticate("jwt", { session: false }),
    roleAuthorization(['PHYSICIAN']),
    physicians.dropPatient
)

/**
 * Get profile information of a user
 * 
 * @route GET /role/:role
 * @param {string} role - The role of users to retrieve
 * @group Users
 * @operationId List Users with Role
 * @produces application/json application/xml
 * @returns {UserInfo.model} 200 - List of registered users with role
 * @returns {string}  500 - Unexpected error
 */
router.get("/profile",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    physicians.getPhysicianInfo
)

/**
 * Get profile information of a user
 * 
 * @route GET /role/:role
 * @param {string} role - The role of users to retrieve
 * @group Users
 * @operationId List Users with Role
 * @produces application/json application/xml
 * @returns {UserInfo.model} 200 - List of registered users with role
 * @returns {string}  500 - Unexpected error
 */
router.post("/profile", [
    check('email').normalizeEmail().isEmail(),
    check('password').isLength({ min: 5 }),
    check('name').escape(),
    check('role', 'role does not exist').exists().custom((value, { req }) => (value === "PATIENT" || value === "PHYSICIAN")),
    check('birthDate').isISO8601(),
    check('gender').escape(),
    check('phoneNumber').isMobilePhone("pt-PT")
  ],
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    physicians.updateProfileInfo
)


/**
 * Get profile information of a user
 * 
 * @route GET /role/:role
 * @param {string} role - The role of users to retrieve
 * @group Users
 * @operationId List Users with Role
 * @produces application/json application/xml
 * @returns {UserInfo.model} 200 - List of registered users with role
 * @returns {string}  500 - Unexpected error
 */
router.get("/patients",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    physicians.listPatients
)



export default router;