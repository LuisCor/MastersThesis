import Physicians, { PhysicianInterface } from "../schemas/PhysicianSchema";
import Patients, { PatientInterface, PatientLoginInterface } from "../schemas/PatientSchema";
import mongoose, { Mongoose, Model } from "mongoose";
import { Request, Response } from "express";
import { UserRequest } from "../auth/auth";


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

}