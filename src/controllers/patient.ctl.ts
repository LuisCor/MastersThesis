import Patients, { PatientInterface, PatientLoginInterface } from "../schemas/PatientSchema";
import mongoose from "mongoose";
import { Request, Response } from "express"
import { UserRequest } from "../auth/auth";
import { UploadedFile } from "express-fileupload";


export default class PatientController {

    constructor() {

    }


    public async getPatientInfo(req: any, res: any) {

        await Patients.findById(req.user._id, '-password -__v', (err, patient) => {
            if (err)
                return res.status(400).send({ error: "Could not retrieve patient information" + err });
            if (patient === undefined)
                return res.status(400).send({ error: "Patient " + req.user._id + " not found" });
            else {
                return res.status(200).send(patient);
            }
        })

    }

    public async updateProfileInfo(req: any, res: any) {
        try {
            if (req.body.password)
                return res.status(400).send({ error: "Password can not be changed this way" })

            const updatedUser = await Patients.findByIdAndUpdate(req.user._id, req.body)

            return res.status(200).send({ message: "User updated" })
        } catch (error) {
            console.error(error); return res.status(500).send({ error: "An error occurred when updating: " + error })
        }
    }

    public async updateProfileImage(request: Request, res: Response) {
        const req = request as UserRequest;

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No image was uploaded.');
        }

        let imageFile = req.files.file as UploadedFile;

        if (req.body.patientID === undefined)
            return res.status(400).send({ error: "Could not post patient information" });

        await Patients.findById(req.body.patientID, (err, patient) => {
            if (err)
                return res.status(400).send({ error: "Could not retrieve patient information" + err });
            if (patient === undefined)
                return res.status(400).send({ error: "Patient " + req.body.patientID + " not found" });
            else {
                // Use the mv() method to place the file somewhere on your server
                imageFile.mv(process.env.USER_IMAGES + "/" + req.body.patientID + ".png", function (err: any) {
                    if (err) {
                        console.log(err)
                        return res.status(500).send(err);
                    }

                    return res.status(200).send('Profile image uploaded');
                });
            }
        })
    }

    public async getProfileImage(request: Request, res: Response) {
        const req = request as UserRequest;

        if (req.params.patientID === undefined)
            return res.status(400).send({ error: "Could not retrieve patient information" });

        await Patients.findById(req.params.patientID, (err, patient) => {
            if (err)
                return res.status(400).send({ error: "Could not retrieve patient information" + err });
            if (patient === undefined)
                return res.status(400).send({ error: "Patient " + req.params.patientID + " not found" });
            else {
                res.sendFile(process.env.USER_IMAGES + '/' + req.params.patientID + ".png", {
                    headers: {
                        'Content-Type': 'image/png',
                        'Content-Disposition': 'inline'
                    }
                }, function (err: any) {
                    if (err)
                        if (!res.headersSent)
                            res.status(500).send("error occured")
                })
            }
        })



    }



    public async getPatientInfoByID(req: any, res: any) {

        await Patients.findById(req.params.patientID, '-password -__v', (err, patient) => {
            if (err)
                return res.status(400).send({ error: "Could not retrieve patient information" + err });
            if (patient === undefined)
                return res.status(400).send({ error: "Patient " + req.user._id + " not found" });
            else {
                return res.status(200).send(patient);
            }
        })

    }


    //Returns the list of physicians taking care of this patient
    public listPhysicians() {
        return { message: "method not implemented yet" }
    }

    //Returns the list of pending exercises
    public listExercises() {
        return { message: "method not implemented yet" }
    }


    //Returns patients with search term comming as param
    public async getPatientByName(request: Request, res: Response) {
        const req = request as UserRequest;

        let foundAppoints;
        let searchName = req.query.name as string

        await Patients.find({ name: { $regex: '.*' + searchName + '.*', $options: "i" } }, '-password -__v', (err, patient) => {
            if (err)
                return res.status(400).send({ error: "Could not find patient" + err });
            if (patient === undefined)
                return res.status(400).send({ error: "Patient with name " + searchName + " not found" });
            else {
                return res.status(200).send(patient);
            }
        })

    }


    //Returns the patient's medical history
    public async getPatientHistory(request: Request, res: Response) {
        const req = request as UserRequest;

        try {

            const evals = await Patients.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(req.params.patientID as any)
                    },
                },
                {
                    $lookup:
                    {
                        from: "patientevals", // Other Collection
                        localField: "_id", // Name of the key to be aggregated with the other collection
                        foreignField: "patient",    // Name of the key from the other collection to be aggregated with "localField"
                        as: "patientevals"     // Name of the resulting collection from the aggregation
                    }
                },
                {
                    $lookup:
                    {
                        from: "physioevals", // Other Collection
                        localField: "_id", // Name of the key to be aggregated with the other collection
                        foreignField: "patient",    // Name of the key from the other collection to be aggregated with "localField"
                        as: "physioevals"     // Name of the resulting collection from the aggregation
                    }
                },
                {
                    $lookup:
                    {
                        from: "exercises", // Other Collection
                        localField: "_id", // Name of the key to be aggregated with the other collection
                        foreignField: "patient",    // Name of the key from the other collection to be aggregated with "localField"
                        as: "exercises"     // Name of the resulting collection from the aggregation
                    }
                },
                {
                    //Remove the fields from the aggregation
                    $project: {
                        "_id": 1,
                        "patientevals": 1,
                        "physioevals": 1,
                        "exercises": 1
                    }

                }
            ]).exec();

            //Aggregate returns an array since it does not know how many elements will be returned from the query,
            //  however, since the query is done under the "_id" attribute, there should only be one element returned
            //  A check will be done here for safety eventhough there are no conditions where this array can be larger then 1.

            if (evals.length > 1)
                throw new Error("Multiple users were found with the same id")

            return res.status(200).send(evals.pop())

        } catch (error) {
            console.error(error); return res.status(400).send({ error: "An error occurred: " + error })
        }
    }



    //Returns the first 20 patients, if a creation date is provided, it returns the following 20 patients
    public async getAllPatients(request: Request, res: Response) {
        const req = request as UserRequest;

        await Patients
            .find({ creationDate: { $lt: Number(req.params.creationDate) } }, '-password -__v')
            .sort({ 'creationDate': -1 })
            .limit(20)
            .exec(
                (err, patients) => {
                    if (err)
                        return res.status(400).send({ error: err });
                    else {
                        return res.status(200).send(patients);
                    }
                })
    }

}