import { Request, Response } from "express";
import mongoose from "mongoose";

import PatientEvals from "../schemas/PatientEvalSchema";

import { UserRequest } from "../auth/auth";
import Patients from "../schemas/PatientSchema";

export default class PatientEvalController {

    constructor() {

    }

    public async listPatientEvals(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            const evals = await PatientEvals.find({ patient: req.params.patientID as unknown as mongoose.Schema.Types.ObjectId })

            return res.status(200).send(evals)
        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }

    public async listPhysicianEvals(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            //const evals = await PatientEvals.find({ physiatrist: req.params.physicianID as unknown as mongoose.Schema.Types.ObjectId })

            console.log(req.user._id)

            let evals = await PatientEvals.aggregate([
                {
                    $match: {
                        physiatrist: new mongoose.Types.ObjectId(req.user._id as any)
                    },
                },
                {
                    $lookup:
                    {
                        from: "patients", // Other Collection
                        localField: "patient", // Name of the key to be aggregated with the other collection
                        foreignField: "_id",    // Name of the key from the other collection to be aggregated with "localField"
                        as: "patientsInfo"     // Name of the resulting collection from the aggregation
                    }
                },
                {
                    //Remove the fields from the aggregation
                    $project: {
                        "__v": 0,
                        "patientsInfo.password": 0,
                        "patientsInfo.identificationNum": 0,
                        "patientsInfo.fiscalNumber": 0,
                        "patientsInfo.job": 0,
                        "patientsInfo.healthSystem": 0,
                        "patientsInfo.healthSystemNum": 0,
                        "patientsInfo.physicians": 0,
                        "patientsInfo.__v": 0,
                    }

                }
            ]).exec();


            let normalizedEvals = evals.map((value: any, index: number) => {
                let currentEval = value.patientsInfo.pop()
                return {
                    ...value,
                    patientName: currentEval.name,
                    patientEmail: currentEval.email
                }
            })


            return res.status(200).send(normalizedEvals)
        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }

    public async getPatientEval(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            const evals = await PatientEvals.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(req.params.patEvalID as any)
                    },
                },
                {
                    $lookup:
                    {
                        from: "patients", // Other Collection
                        localField: "patient", // Name of the key to be aggregated with the other collection
                        foreignField: "_id",    // Name of the key from the other collection to be aggregated with "localField"
                        as: "patientsInfo"     // Name of the resulting collection from the aggregation
                    }
                },
                {
                    //Remove the fields from the aggregation
                    $project: {
                        "__v": 0,
                        "patientsInfo.password": 0,
                        "patientsInfo.identificationNum": 0,
                        "patientsInfo.fiscalNumber": 0,
                        "patientsInfo.job": 0,
                        "patientsInfo.healthSystem": 0,
                        "patientsInfo.healthSystemNum": 0,
                        "patientsInfo.physicians": 0,
                        "patientsInfo.__v": 0,
                    }

                }
            ]).exec();


            let normalizedEvals = evals.map((value: any, index: number) => {
                let currentEval = value.patientsInfo.pop()
                delete value.patientsInfo
                let temp = {
                    ...value,
                    patientName: currentEval.name,
                    patientEmail: currentEval.email
                }
                return temp
            })


            return res.status(200).send(normalizedEvals.pop())

        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }


    public async createPatientEval(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            req.body.creationDate = new Date();
            req.body.physiatrist = req.user._id;

            const patient = await Patients.findById(req.body.patient)
            if (patient) {
                const evals = await PatientEvals.create(req.body)
                return res.status(200).send(evals)
            }
            else
                return res.status(400).send({ error: "Patient: " + req.body.patient + " does not exist" })

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
                return res.status(200).send({ message: "Physiotherapist added to Patient Evaluation" })
            } else return res.status(400).send({ error: "Could not add physiotherapist" })

        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }
}