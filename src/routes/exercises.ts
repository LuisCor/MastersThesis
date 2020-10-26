import express, { Request, Response } from 'express';
import passport from "passport";
import { roleAuthorization } from "../auth/auth"
import { specialtyAuthorization } from '../schemas/PhysicianSchema';
import ExerciseController from '../controllers/exercises.ctl';
import path from 'path';
const router = express.Router();
const exercises = new ExerciseController();


/**
 * Create a new patient evaluation
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
    roleAuthorization(['PHYSICIAN', 'PATIENT']),
    exercises.createExercise
);

/**
 * Create a new patient evaluation
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
    roleAuthorization(['PHYSICIAN', 'PATIENT']),
    exercises.getExercise
);


/**
 * Get a Patient's patient evaluations
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
    roleAuthorization(['PHYSICIAN', 'PATIENT']),
    exercises.listPatientExercises
);


export default router;