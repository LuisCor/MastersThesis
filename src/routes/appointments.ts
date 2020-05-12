import express from 'express';
import passport from "passport";
import jwt from "jsonwebtoken";
import { roleAuthorization } from "../auth/auth"
import AppointmentController from '../controllers/appointment.ctl';
const router = express.Router();
const appointments = new AppointmentController();



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
router.get("/", passport.authenticate('jwt', { session: false }), roleAuthorization(['PATIENT', 'PHYSICIAN']), appointments.getUserAppointments);

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
router.post("/", passport.authenticate('jwt', { session: false }), roleAuthorization(['PATIENT', 'PHYSICIAN']), appointments.createAppointment);


export default router;