import Patients, { PatientInterface, PatientLoginInterface } from "../schemas/PatientSchema";
import { Request, Response } from "express"
import { UserRequest } from "../auth/auth";
//TODO : This class


export default class PatientController {

    constructor() {

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

}