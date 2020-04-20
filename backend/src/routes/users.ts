// const userController = require("../controllers/user.ctl.ts");

import express = require('express');
const UsersSchema = require('../schemas/UsersSchema');
const router = express.Router();

/**
 * @typedef LoginInfo
 * @property {string} username
 * @property {string} password - This is a secret shh 🤫
 */

 /**
 * @typedef UserInfo
 * @property {string} id - Must be sent as 0 (to be fixed)
 * @property {string} username
 * @property {string} password
 * @property {string} name
 * @property {string} email
 */

/**
 * Loggs in a user, returns a token if successful
 * (Not Implemented, just a mockup)
 * 
 * @route POST /login
 * @param {LoginInfo.model} point.body.required - the new point
 * @group Users - These are the actions to be done by or to a user
 * @operationId login
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User login status
 * @returns {string}  400 - Unexpected error
 */
router.get("/", (req, res) => {
    UsersSchema.find((err:any, data:any) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true, data: data });
      });
})

/**
 * Loggs in a user, returns a token if successful
 * (Not Implemented, just a mockup)
 * 
 * @route POST /login
 * @param {LoginInfo.model} point.body.required - the new point
 * @group Users - These are the actions to be done by or to a user
 * @operationId login
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User login status
 * @returns {string}  400 - Unexpected error
 */
router.post("/login", (req, res) => {
    res.send('Login attempt');
});

/**
 * 
 * Creates a new user on the database
 * 
 * 
 * @route POST /login
 * @param {UserInfo.model} point.body.required - the new user
 * @group Users - These are the actions to be done by or to a user
 * @operationId create
 * @produces application/json application/xml
 * @consumes application/json application/xml
 * @returns {string} 200 - User creating successful
 * @returns {string}  400 - Unexpected error
 */
router.post("/create", (req, res) => {

    let newUser = new UsersSchema();

    console.log(req.body)
    let {id, username, password, name, email} = req.body;

    //TODO move these checks to the appropriate schema, shouldn't be done here
    if ((!id && id !== 0) || !username || !password || !name || !email) {
        return res.json({
          success: false,
          error: 'INVALID INPUTS',
        });
      }
      newUser.id = id;
      newUser.username = username;
      newUser.password = password;
      newUser.nema = name;
      newUser.email = email;
      newUser.save((err:any) => {
        if (err) return res.json({ success: false, error: err });
        return res.json({ success: true });
      });

    res.send('Login attempt');
});

router.get("/profile", (req, res) => {
    res.send('Profile info here');
});



module.exports = router;