import { Request, Response } from "express";
import mongoose from "mongoose";

import PhysioEvals from "../schemas/PhysioEvalSchema";

import { UserRequest } from "../auth/auth";
import Patients from "../schemas/PatientSchema";

export default class PhysioEvalController {

    constructor() {

    }

    public async listPhysioEvals(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            const evals = await PhysioEvals.find({ patient: req.params.patientID as unknown as mongoose.Schema.Types.ObjectId })

            return res.status(200).send(evals)
        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }


    public async createPhysioEval(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            req.body.creationDate = new Date();
            req.body.physiotherapist = req.user._id;

            const patient = await Patients.findById(req.body.patient)
            if (patient) {
                const evals = await PhysioEvals.create(req.body)
                return res.status(200).send(evals)
            }
            else
                return res.status(400).send({ error: "Patient: " + req.body.patient + " does not exist" })

        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }

}