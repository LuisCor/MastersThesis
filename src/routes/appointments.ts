import express from 'express';
import passport from "passport";
import {UserRequest} from "../auth/auth"

import { roleAuthorization } from "../auth/auth"
import AppointmentController from '../controllers/appointment.ctl';
import { specialtyAuthorization } from '../schemas/PhysicianSchema';

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
router.get("/",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PATIENT', 'PHYSICIAN']),
    appointments.getAppointments
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
router.get("/between",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PATIENT', 'PHYSICIAN']),
    appointments.getAppointmentsBetween
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
router.get("/today",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PATIENT', 'PHYSICIAN']),
    appointments.getTodaysAppointments
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
router.post("/",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PATIENT', 'PHYSICIAN']),
    appointments.createAppointment
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
router.delete("/:appointID",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PATIENT', 'PHYSICIAN']),
    appointments.deleteAppointment
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
router.post("/:appointID/accept",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    appointments.acceptAppoint
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
router.post("/:appointID/reject",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    appointments.rejectAppointment
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
router.get("/patient/:patientID",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    appointments.patientAppointments
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
router.post("/patientEval/:appointID/:evalID",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    specialtyAuthorization(['PHYSIATRIST', 'PHYSIOTHERAPIST']),
    appointments.addPatientEval
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
router.delete("/patientEval/:appointID",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN']),
    specialtyAuthorization(['PHYSIATRIST', 'PHYSIOTHERAPIST']),
    appointments.removePatientEval
);



export default router;