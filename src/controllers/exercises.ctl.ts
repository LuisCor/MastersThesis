import { Request, Response } from "express";
import mongoose from "mongoose";

import Exercises from "../schemas/ExerciseSchema";

import { UserRequest } from "../auth/auth";
import Patients from "../schemas/PatientSchema";

export default class ExerciseController {

    constructor() {

    }

    public async listPatientExercises(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            const exercises = await Exercises.find({ patient: req.params.patientID as unknown as mongoose.Schema.Types.ObjectId })

            return res.status(200).send(exercises)
        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }


    public async createExercise(request: Request, res: Response) {
        const req = request as any;

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        try {
            req.body.creationDate = new Date();

            const patient = await Patients.findById(req.body.patient)
            if (patient) {

                const exercise = await Exercises.create(req.body)
                let exerciseFile = req.files.exerciseFile;
                exerciseFile.mv("/root/uploads/" + exercise._id + ".json", function (err: any) {
                    if (err) {
                        console.log(err)
                        throw new Error(err)
                    }
                });
                return res.status(200).send(exercise)
            }
            else
                return res.status(400).send({ error: "Patient: " + req.body.patient + " does not exist" })

        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }


    public async getExercise(request: Request, res: Response) {
        const req = request as UserRequest;

        console.log(req.query)
        console.log(req.query.exerciseID)
        try {
            const exercises = await Exercises.findById(req.query.exerciseID)
            console.log(exercises)
            if(!exercises)
                throw Error("Exercise not found")

            
            res.download('/root/uploads/' + exercises?._id + '.json', function (err: any) {
                if (err) {
                    if (!res.headersSent)
                        res.status(500).send("Exercise registered, but file was not found")
                } else {
                    console.log(res.headersSent)
                }
            })
    
        } catch (error) {
            console.error(error); 
            return res.status(400).send({ error: "An error occurred: " + error })
        }

    }


}