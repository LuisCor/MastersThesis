import Physicians, { PhysicianInterface } from "../schemas/PhysicianSchema";
import Patients, { PatientInterface, PatientLoginInterface } from "../schemas/PatientSchema";
import mongoose, { Mongoose, Model } from "mongoose";

//TODO : This class


export default class PhysicianController {

    constructor() {

    }

    public async updateProfileInfo(req: any, res: any) {
        try {
            if(req.body.password)
                return res.status(400).send({error: "Password can not be changed this way"})
                
            const updatedUser = await Physicians.findByIdAndUpdate(req.user._id, req.body)

            return res.status(200).send({message: "User updated"})
        } catch (error) {
            console.error(error); return res.status(500).send({error: "An error occurred when updating: " + error})
        }
    }

    public async getPhysicianInfo(req: any, res: any) {

        try {
            const physician = await Physicians.findById(req.user._id, '-password -__v');
            return res.status(200).send(physician);
        } catch (err) {
            console.log(err)
            return res.status(400).send({ error: "Could not retrieve physician's information\n" + err });
        }
        
    }

    // Adds a patient to the list of patients under this physician's care
    public async adoptPatient(req: any, res: any) {
        const physicianID = req.user._id;
        const patientID = req.params.patientID;

        // Attempt to update the physician's list of patient's under care
        //   if successful also update the patient's list of physicians
        try {
            //Note: This is an update and not a "find() -> modify -> save()" because save recreates the documento rewriting other attributes, messing things up
            const phydoc = await Physicians.update({ _id: physicianID }, { $push: { patients: patientID as mongoose.Schema.Types.ObjectId} });
            if (phydoc.nModified > 0) {
                const patdoc = await Patients.update({ _id: patientID }, { $push: { physicians: physicianID as mongoose.Schema.Types.ObjectId } });
                if (phydoc.nModified !== patdoc.nModified)
                    return res.status(500).send({ error: "Database has become inconsistent" }) 
                    //This is serious and should never happen
                else
                    return res.status(200).send({message: "Patient adopted"})
            }
            else
                return res.status(400).send({ error: "Patient is already adopted" });
        } catch (err) {
            console.log(err)
            return res.status(400).send({ error: "Patient could not be adopted: \n" + err });
        }

    }


    public async dropPatient(req: any, res: any) {
        const physicianID = req.user._id;
        const patientID = req.params.patientID;

        try {
            const phydoc = await Physicians.update({ _id: physicianID }, { $pull: { patients: patientID as any } });
            if (phydoc.nModified > 0) {
                const patdoc = await Patients.update({ _id: patientID }, { $pull: { physicians: physicianID as any } });
                if (phydoc.nModified !== patdoc.nModified){
                    return res.status(500).send({ error: "Database has become inconsistent" }) 
                    //This is serious and should never happen
                }
                else
                    return res.status(200).send({message: "Patient dropped"})
            }
            else
                return res.status(400).send({ error: "Patient is not adopted" });
        } catch (err) {
            console.log(err)
            return res.status(400).send({ error: "Patient could not be dropped: \n" + err });
        }

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




    /////////////////////////////////////////////////////////////////////////////LEGACY CODE - FOR REFERENCE ONLY
    // public adoptPatient(physicianID: string, patientID: string) {
    //     return new Promise((resolve, reject) => {
    //         Patients.findById(patientID, (err: any, patient: PatientInterface) => {
    //             if (err)
    //                 return reject({ error: "Patient not found: ", patientID })
    //             else {
    //                 Physicians.findById(physicianID, (err: any, physician: PhysicianInterface) => {
    //                     if (err)
    //                         return reject({ error: "Could not adopt patient: ", err })
    //                     else {
    //                         if (physician.patients.indexOf(patient._id) > -1)
    //                             return reject({ error: "Patient is already adopted" })
    //                         else {
    //                             patient.physicians.push(physician._id);
    //                             patient.save();
    //                             physician.patients.push(patient._id);
    //                             physician.save();
    //                             resolve({ message: "Patient adopted" });
    //                         }
    //                     }
    //                 })
    //             }
    //         })
    //     })
    // }


    // public dropPatient(physicianID: string, patientID: string) {
    //     return new Promise((resolve, reject) => {

    //         Physicians.update({ _id: physicianID }, { $pull: { patients: patientID as any } }, (err, phydoc) => {
    //             if (err)
    //                 return reject({ error: "Could not drop patient: ", err })

    //             if (phydoc.nModified > 0) {
    //                 Patients.update({ _id: patientID }, { $pull: { physicians: physicianID as any } }, (err, patdoc) => {
    //                     if (err)
    //                         return reject({ error: "Could not drop patient: ", err })
    //                     else if (phydoc.nModified !== patdoc.nModified)
    //                         return reject({ error: "Database has become inconsistent" }) //This is serious and should never happen
    //                     else
    //                         resolve({ message: "Patient droped" });
    //                 })
    //             } else
    //                 return reject({ error: "Patient is not adopted" })

    //         })
    //     })
    // }



}