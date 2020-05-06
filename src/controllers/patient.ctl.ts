import Patients, { PatientInterface, PatientLoginInterface } from "../schemas/PatientSchema";
//TODO : This class


export default class PatientController {

    constructor() {

    }

    // public getPatientInfo(patientID: string) {

    //     return new Promise((resolve, reject) => {
    //         Patients.findById(patientID,'-password -__v', (err, patient) => {
    //             if(err)
    //                 return reject({error: "Could not retrieve patient information", err})
    //             if(patient === undefined)
    //                 return reject({error: "Patient " + patientID + " not found"})
    //             else {
    //                 resolve(patient);
    //             }
    //         })
    //     })

    // }

    public async getPatientInfo(req: any, res: any) {

        Patients.findById(req.user._id, '-password -__v', (err, patient) => {
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


}