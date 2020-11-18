import Physicians, { PhysicianInterface } from "../schemas/PhysicianSchema";
import Patients, { PatientInterface, PatientLoginInterface } from "../schemas/PatientSchema";
import mongoose, { Mongoose, Model } from "mongoose";
import { Request, Response } from "express";
import { UserRequest } from "../auth/auth";
import { UploadedFile } from "express-fileupload";


export default class PhysicianController {

    constructor() {

    }

    public async updateProfileInfo(request: Request, res: Response) {
        const req = request as UserRequest;
        try {
            if (req.body.password)
                return res.status(400).send({ error: "Password can not be changed this way" })

            const updatedUser = await Physicians.findByIdAndUpdate(req.user._id, req.body)

            return res.status(200).send({ message: "User updated" })
        } catch (error) {
            console.error(error); return res.status(500).send({ error: "An error occurred when updating: " + error })
        }
    }

    public async getPhysicianInfo(request: Request, res: Response) {
        const req = request as UserRequest;

        try {
            const physician = await Physicians.findById(req.user._id, '-password -__v');
            return res.status(200).send(physician);
        } catch (err) {
            console.log(err)
            return res.status(400).send({ error: "Could not retrieve physician's information\n" + err });
        }

    }


    public async updateProfileImage(request: Request, res: Response) {
        const req = request as UserRequest;

        console.log(req.body)

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No image was uploaded.');
        }

        let imageFile = req.files.file as UploadedFile;

        if (req.body.physicianID === undefined)
            return res.status(400).send({ error: "Could not post physician information"});

        await Physicians.findById(req.body.physicianID, (err, physician) => {
            if (err)
                return res.status(400).send({ error: "Could not retrieve physician information" + err });
            if (physician === undefined)
                return res.status(400).send({ error: "Physician " + req.body.physicianID + " not found" });
            else {
                // Use the mv() method to place the file somewhere on your server
                imageFile.mv(process.env.USER_IMAGES + "/" + req.body.physicianID + ".png", function (err: any) {
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

        if (req.params.physicianID === undefined)
            return res.status(400).send({ error: "Could not retrieve physician information" });

        await Physicians.findById(req.params.physicianID, (err, physician) => {
            if (err)
                return res.status(400).send({ error: "Could not retrieve physician information" + err });
            if (physician === undefined)
                return res.status(400).send({ error: "physician " + req.params.physicianID + " not found" });
            else {
                res.sendFile(process.env.USER_IMAGES + '/' + req.params.physicianID + ".png", {
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

    // Adds a patient to the list of patients under this physician's care
    public async adoptPatient(request: Request, res: Response) {
        const req = request as UserRequest;

        const physicianID = req.user._id;
        const patientID = req.params.patientID;

        // Attempt to update the physician's list of patient's under care
        //   if successful also update the patient's list of physicians
        try {
            const physician = await Physicians.findById(physicianID)

            //Verify patient isn't already adopted
            if (physician?.patients.indexOf(patientID as any) !== -1)
                return res.status(400).send({ error: "Patient is already adopted" });

            //Note: This is an update and not a "find() -> modify -> save()" because save recreates the documento rewriting other attributes, messing things up
            const phydoc = await Physicians.update({ _id: physicianID }, { $push: { patients: patientID as unknown as mongoose.Schema.Types.ObjectId } });
            if (phydoc.nModified > 0) {
                const patdoc = await Patients.update({ _id: patientID }, { $push: { physicians: physicianID as unknown as mongoose.Schema.Types.ObjectId } });
                if (phydoc.nModified !== patdoc.nModified)
                    return res.status(500).send({ error: "Database has become inconsistent" })
                //This is serious and should never happen
                else
                    return res.status(200).send({ message: "Patient adopted" })
            }

        } catch (err) {
            console.log(err)
            return res.status(400).send({ error: "Patient could not be adopted: \n" + err });
        }

    }


    public async dropPatient(request: Request, res: Response) {
        const req = request as UserRequest;

        const physicianID = req.user._id;
        const patientID = req.params.patientID;

        try {
            const phydoc = await Physicians.update({ _id: physicianID }, { $pull: { patients: patientID as any } });
            if (phydoc.nModified > 0) {
                const patdoc = await Patients.update({ _id: patientID }, { $pull: { physicians: physicianID as any } });
                if (phydoc.nModified !== patdoc.nModified) {
                    return res.status(500).send({ error: "Database has become inconsistent" })
                    //This is serious and should never happen
                }
                else
                    return res.status(200).send({ message: "Patient dropped" })
            }
            else
                return res.status(400).send({ error: "Patient is not adopted" });
        } catch (err) {
            console.log(err)
            return res.status(400).send({ error: "Patient could not be dropped: \n" + err });
        }

    }

    public async listPatients(request: Request, res: Response) {
        const req = request as UserRequest;

        const physicianID = req.user._id;

        try {
            const patients = await Physicians.aggregate([
                {
                    $match: {
                        _id: new mongoose.Types.ObjectId(physicianID as any),
                    }
                },
                {

                    $lookup:
                    {
                        from: "patients", // Other Collection
                        localField: "patients", // Name of the key to be aggregated with the other collection
                        foreignField: "_id",    // Name of the key from the other collection to be aggregated with "localField"
                        as: "patientsInfo"     // Name of the resulting collection from the aggregation
                    },
                },
                {

                    //Remove the fields from the aggregation
                    $project: {
                        "_id": 0,
                        "specialty": 0,
                        "patients": 0,
                        "email": 0,
                        "password": 0,
                        "name": 0,
                        "role": 0,
                        "birthDate": 0,
                        "gender": 0,
                        "phoneNumber": 0,
                        "physicianID": 0,
                        "__v": 0,
                        "patientsInfo.password": 0,
                        "patientsInfo.__v": 0,
                    }
                }
            ]).exec();


            const filteredPatients = patients.map((value: any, index: number) => {
                return value.patientsInfo
            })

            return res.status(200).send(filteredPatients.pop())

        } catch (err) {
            console.log(err)
            return res.status(400).send({ error: "An error occured: \n" + err });
        }

    }


    //Returns the first 20 physicians, if a creation date is provided, it returns the following 20 physicians
    public async getAllPhysicians(request: Request, res: Response) {
        const req = request as UserRequest;

        await Physicians
            .find({ creationDate: { $lt: Number(req.params.creationDate) } }, '-password -__v')
            .sort({ 'creationDate': -1 })
            .limit(20)
            .exec(
                (err, physicians) => {
                    if (err)
                        return res.status(400).send({ error: err });
                    else {
                        return res.status(200).send(physicians);
                    }
                })
    }


    //Returns patients with search term comming as param
    public async getPhysicianByName(request: Request, res: Response) {
        const req = request as UserRequest;

        let foundAppoints;
        let searchName = req.query.name as string

        await Physicians.find({ name: { $regex: '.*' + searchName + '.*', $options: "i" } }, '-password -__v', (err, patient) => {
            if (err)
                return res.status(400).send({ error: "Could not find physician" + err });
            if (patient === undefined)
                return res.status(400).send({ error: "Physician with name " + searchName + " not found" });
            else {
                return res.status(200).send(patient);
            }
        })

    }

}