//const userController = require("../controllers/user.ctl.ts");

import express = require ('express');
const router = express.Router();


/**
 * This function comment is parsed by doctrine
 * This actually should be a POST but f*ck it
 * @route GET /login
 * @group login - Logs in the user
 * @param {string} email.query.required - username or email - eg: user@domain
 * @param {string} password.query.required - user's password.
 * @returns {object} 200 - An array of user info
 * @returns {Error}  default - Unexpected error
 */
router.get( "/login", ( req, res ) => {
    res.send('Login attempt');
} );

module.exports = router;