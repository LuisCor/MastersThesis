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
router.get("/:patientID",
    passport.authenticate('jwt', { session: false }),
    roleAuthorization(['PHYSICIAN', 'PATIENT']),
    exercises.listPatientExercises
);

// file upload api
router.post('/upload', (req: any, res: any) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv(path.join(__dirname+"filename.file"), function (err : any) {
        if (err){
            console.log(err)
            return res.status(500).send(err);
        }

        res.send('File uploaded! \n Location: ' + path.join(__dirname+"filename.file"));
    });
})


router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname+'/index.html'));
});


export default router;