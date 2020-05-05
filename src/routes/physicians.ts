///////// Physician Routes
//  Here are the all the available functions related to User.
//  These functions are responsible for receiving and interpreting the incomming requests
//  and produce appropriate responses based on other system functions

import express from 'express';
import passport from "passport";
import jwt from "jsonwebtoken";
import { roleAuthorization } from "../auth/auth"
import PhysicianController from '../controllers/physician.ctl';
import { UserInterface, UserLoginInterface, UserRequestInfo } from '../schemas/UsersSchema';
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
 * Lists all users registered in the system
 * 
 * @route GET /
 * @group Users - The actions and informations related to the system's users
 * @operationId List all Users
 * @produces application/json application/xml
 * @returns {UserInfo.model} 200 - List of registered users
 * @returns {string}  500 - Unexpected error
 */
router.get("/", passport.authenticate("jwt", {session : false}), roleAuthorization(['PHYSICIAN']), (req, res, next) => {
  // Get the list of available users from the controller
  physicians.listUsers()
    .then((data) => (res.status(200).send(data)))
    .catch((data) => (res.status(500).send(data)));
})


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
router.post("/adopt/:patientID", passport.authenticate("jwt", {session : false}), roleAuthorization(['PHYSICIAN']), (req, res, next) => {
  // Get the list of available users from the controller
  physicians.adoptPatient((req.user as UserRequestInfo)._id , req.params.patientID)
    .then((data) => (res.status(200).send(data)))
    .catch((data) => (res.status(500).send(data)));
})

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
router.post("/drop/:patientID", passport.authenticate("jwt", {session : false}), roleAuthorization(['PHYSICIAN']), (req, res, next) => {
  // Get the list of available users from the controller
  physicians.dropPatient((req.user as UserRequestInfo)._id , req.params.patientID)
    .then((data) => (res.status(200).send(data)))
    .catch((data) => (res.status(500).send(data)));
})

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
router.get("/profile/:username", passport.authenticate('jwt', { session: false }), (req, res) => {

  // Get the list of users with role from the controller
  physicians.profileInfo(req.params.username as string)
    .then((data) => (res.status(200).send(data)))
    .catch((data) => (res.status(500).send(data)));

})



export default router;