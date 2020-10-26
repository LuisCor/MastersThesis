import { Request, Response } from "express";
import mongoose from "mongoose";

import Exercises from "../schemas/ExerciseSchema";

import { UserRequest } from "../auth/auth";
import Patients from "../schemas/PatientSchema";
import * as fs from 'fs';

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
        // const req = request as any;

        // if (!req.files || Object.keys(req.files).length === 0) {
        //     return res.status(400).send('No files were uploaded.');
        // }

        // try {
        //     req.body.creationDate = new Date();

        //     const patient = await Patients.findById(req.body.patient)
        //     if (patient) {

        //         const exercise = await Exercises.create(req.body)
        //         let exerciseFile = req.files.exerciseFile;
        //         exerciseFile.mv(process.env.EXERCISES + "/" + exercise._id + ".json", function (err: any) {
        //             if (err) {
        //                 console.log(err)
        //                 throw new Error(err)
        //             }
        //         });
        //         return res.status(200).send(exercise)
        //     }
        //     else
        //         return res.status(400).send({ error: "Patient: " + req.body.patient + " does not exist" })

        // } catch (error) {
        //     console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        // }


        const req = request as UserRequest;

        try {
            req.body.creationDate = new Date();
            req.body.patient = req.user._id;

            console.log(req.body)

            const patient = await Patients.findById(req.body.patient)
            if (patient) {
                const exercise = await Exercises.create(
                    {
                        creationDate: req.body.creationDate,
                        patient: req.body.patient
                    }
                )

                let data = JSON.stringify(req.body.data);
                fs.writeFile(process.env.EXERCISES + "/" + exercise._id + ".json", data, (err) => {
                    if (err) {
                        console.log(err)
                        throw new Error(JSON.stringify(err))
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

        try {
            const exercises = await Exercises.findById(req.query.exerciseID)
            console.log(exercises)
            if (!exercises)
                throw Error("Exercise not found")


            res.sendFile(process.env.EXERCISES + "/" + req.query.exerciseID + ".json", {
                headers: {
                    'Content-Type': 'application/json',
                }
            }, function (err: any) {
                if (err) {
                    // Handle error, but keep in mind the response may be partially-sent
                    // so check res.headersSent
                    console.log(res.headersSent)
                    console.log(err)
                    if (!res.headersSent)
                        res.status(500).send("error occured")
                } else {
                    // decrement a download credit, etc.
                    console.log(res.headersSent)
                }
                //         })
            })

            } catch (error) {
                console.error(error);
                return res.status(400).send({ error: "An error occurred: " + error })
            }

        }


}