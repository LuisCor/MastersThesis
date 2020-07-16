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
        const req = request as UserRequest;

        try {
            req.body.creationDate = new Date();

            const patient = await Patients.findById(req.body.patient)
            if (patient) {
                const evals = await Exercises.create(req.body)
                return res.status(200).send(evals)
            }
            else
                return res.status(400).send({ error: "Patient: " + req.body.patient + " does not exist" })

        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }

}