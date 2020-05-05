///////// Admin Routes

import express from 'express';
import passport from "passport";
import { roleAuthorization } from "../auth/auth"
import AdminController from '../controllers/admin.ctl';
const router = express.Router();
const controller = new AdminController();


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
router.get("/profile/:username", passport.authenticate('jwt', { session: false }), roleAuthorization(['ADMIN']), (req, res) => {

    // Get the list of users with role from the controller
    controller.profileInfo(req.params._id as string, req.params.role as string)
        .then((data) => (res.status(200).send(data)))
        .catch((data) => (res.status(500).send(data)));

})



export default router;