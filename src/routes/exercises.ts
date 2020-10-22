import express, { Request, Response } from 'express';
import passport from "passport";
import { roleAuthorization } from "../auth/auth"
import { specialtyAuthorization } from '../schemas/PhysicianSchema';
import ExerciseController from '../controllers/exercises.ctl';
import path from 'path';
const router = express.Router();
const exercises = new ExerciseController();


const temphtmlpage = "<html><body> File uploaded! <br> <a href=\"http://localhost:5000/api/exercises/download\">Download</a></body></html>"

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

// /**
//  * Get a Patient's patient evaluations
//  * 
//  * @route Get /
//  * @param {UserInfo.model} point.body.required - The information of the new user
//  * @group Users
//  * @operationId Create a new User
//  * @produces application/json application/xml
//  * @consumes application/json application/xml
//  * @returns {string} 200 - User creation successful
//  * @returns {string}  500 - Unexpected error
//  */
// router.get("/",
//     passport.authenticate('jwt', { session: false }),
//     roleAuthorization(['PHYSICIAN', 'PATIENT']),
//     exercises.getExercise
// );

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


// file upload api
router.post('/upload', (req: any, res: any) => {
    if (!req.files || Object.keys(req.files).length === 0) {
        return res.status(400).send('No files were uploaded.');
    }

    // The name of the input field (i.e. "sampleFile") is used to retrieve the uploaded file
    let sampleFile = req.files.sampleFile;

    // Use the mv() method to place the file somewhere on your server
    sampleFile.mv("/root/uploads/" + "filename.file", function (err: any) {
        if (err) {
            console.log(err)
            return res.status(500).send(err);
        }

        res.send(temphtmlpage);
    });
})

// file upload api
router.get("/download",
    (req: any, res: any) => {

        // res.download('/root/uploads/filename.file', function (err: any) {
        //     if (err) {
        //         // Handle error, but keep in mind the response may be partially-sent
        //         // so check res.headersSent
        //         console.log(res.headersSent)
        //         console.log(err)
        //         if (!res.headersSent)
        //             res.status(500).send("error occured")
        //     } else {
        //         // decrement a download credit, etc.
        //         console.log(res.headersSent)
        //     }
        // })


        res.sendFile(process.env.EXERCISES + "/" + req.query.id + ".json", {
            headers: {
                'Content-Type': 'application/json',
                //'Content-Type': 'object/json', 
                //'Content-Disposition': 'inline'
            }
        }, function (err: any) {
            if (err) {
                // Handle error, but keep in mind the response may be partially-sent
                // so check res.headersSent
                console.log(res.headers)
                console.log(res.headersSent)
                console.log(err)
                if (!res.headersSent)
                    res.status(500).send("error occured")
            } else {
                // decrement a download credit, etc.
                console.log(res.headersSent)
            }
        })


    });

router.get("/", (req, res) => {
    res.sendFile(path.join(__dirname + '/index.html'));
});


export default router;