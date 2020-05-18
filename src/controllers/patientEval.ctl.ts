import { Request, Response } from "express";
import mongoose from "mongoose";

import PatientEvals from "../schemas/PatientEvalSchema";

import { UserRequest } from "../auth/auth";

export default class PatientEvalController {

    constructor() {

    }

    public async listPatientEvals(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            const evals = await PatientEvals.find({ patient: req.params.patientID as unknown as mongoose.Schema.Types.ObjectId })

            return res.status(200).send({ evals })
        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }


    public async createPatientEval(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            req.body.creationDate = new Date();
            req.body.physiatrist = req.user._id;

            const evals = await PatientEvals.create(req.body)

            return res.status(200).send({ evals })
        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }

    public async assignEvalToPhysio(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            const patEval = await PatientEvals.update(
                { _id: req.params.evalID },
                { $push: { physiotherapists: req.params.physioID as unknown as mongoose.Schema.Types.ObjectId } }
            );
            if (patEval.nModified > 0) {
                return res.status(200).send({message : "Physiotherapist added to Patient Evaluation"})
            } else return res.status(400).send({ error: "Could not add physiotherapist" })

        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }
}