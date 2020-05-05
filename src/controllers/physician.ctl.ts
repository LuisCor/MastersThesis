import Physicians, { PhysicianInterface } from "../schemas/PhysicianSchema";
import Patients, { PatientInterface } from "../schemas/PatientSchema";

//TODO : This class


export default class PhysicianController {

    constructor() {

    }


    public adoptPatient(physicianID: string, patientID: string) {
        return new Promise((resolve, reject) => {
            Patients.findById(patientID, (err: any, patient: PatientInterface) => {
                if (err)
                    return reject({ error: "Patient not found: ", patientID })
                else {
                    Physicians.findById(physicianID, (err: any, physician: PhysicianInterface) => {
                        if (err)
                            return reject({ error: "Could not adopt patient: ", err })
                        else {
                            if (physician.patients.indexOf(patient._id) > -1)
                                return reject({ error: "Patient is already adopted" })
                            else {
                                patient.physicians.push(physician._id);
                                patient.save();
                                physician.patients.push(patient._id);
                                physician.save();
                                resolve({ message: "Patient adopted" });
                            }
                        }
                    })
                }
            })
        })
    }

    public dropPatient(physicianID: string, patientID: string) {
        return new Promise((resolve, reject) => {

            Physicians.update({ _id: physicianID }, { $pull: { patients: patientID as any } }, (err, phydoc) => {
                if (err)
                    return reject({ error: "Could not drop patient: ", err })

                if (phydoc.nModified > 0) {
                    Patients.update({ _id: patientID }, { $pull: { physicians: physicianID as any } }, (err, patdoc) => {
                        if (err)
                            return reject({ error: "Could not drop patient: ", err })
                        else if (phydoc.nModified !== patdoc.nModified)
                            return reject({ error: "Database has become inconsistent" }) //This is serious and should never happen
                        else
                            resolve({ message: "Patient droped" });
                    })
                } else
                    return reject({ error: "Patient is not adopted" })

            })
        })
    }



    public listUsers() {
        return new Promise((resolve, reject) => {
            Physicians.find((err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };


    public listWithRole(searchRole: string) {
        return new Promise((resolve, reject) => {
            Physicians.find({ role: searchRole }, (err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };


    public profileInfo(username: string) {
        return new Promise((resolve, reject) => {
            Physicians.find({ username: username }, (err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };

}