import Appointments, { AppointmentInterface } from "../schemas/AppointmentSchema";
import { Request, Response } from 'express';
import { UserRequest } from "../auth/auth"
import mongoose, { connect, Query } from "mongoose";
import Performance from "perf_hooks"
import Patients from "../schemas/PatientSchema";
import Physicians from "../schemas/PhysicianSchema";
import { PatientInterface } from "../schemas/PatientSchema";
import { PhysicianInterface } from "../schemas/PhysicianSchema";

export default class AppointmentSchema {

    constructor() {

    }



    ////// APPOINTMENT METHOD FOR ALL USERS

    public async getTodaysAppointments(request: Request, res: Response) {
        const req = request as UserRequest;

        let foundAppoints;
        let todayStart = new Date();
        todayStart.setHours(0, 0, 0, 0)
        let todayEnd = new Date()
        todayEnd.setHours(23, 59, 59, 999);

        try {
            if (req.user.role === "PATIENT")
                foundAppoints = await Appointments.aggregate([
                    {
                        $match: {
                            physician: new mongoose.Types.ObjectId(req.user._id as any),
                            startDate: { $gte: todayStart, $lt: todayEnd }
                        },
                    },
                    {
                        $lookup:
                        {
                            from: "physicians", // Other Collection
                            localField: "physician", // Name of the key to be aggregated with the other collection
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

            if (req.user.role === "PHYSICIAN")

                foundAppoints = await Appointments.aggregate([
                    {
                        $match: {
                            physician: new mongoose.Types.ObjectId(req.user._id as any),
                            startDate: { $gte: todayStart, $lt: todayEnd }
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



            let normalizedAppoints = foundAppoints.map((value: any, index: number) => {
                return {
                    ...value,
                    patientsInfo: value.patientsInfo.pop()
                }
            })

            const compareAppointments = (a: AppointmentInterface, b: AppointmentInterface) => {
                if (a.startDate < b.startDate) {
                    return -1;
                }
                if (a.startDate > b.startDate) {
                    return 1;
                }
                return 0;
            }


            normalizedAppoints.sort(compareAppointments)


            return res.status(200).send(normalizedAppoints)
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }

    public async getAppointmentsBetween(request: Request, res: Response) {
        const req = request as UserRequest;

        let foundAppoints;
        let startDate = new Date(req.query.startDate as string)
        let endDate = new Date(req.query.endDate as string)

        if (startDate.getTime() > endDate.getTime())
            return res.status(400).send({ error: "startDate cannot be after endDate" })


        try {
            if (req.user.role === "PATIENT")
                foundAppoints = await Appointments.find({
                    patient: req.user._id,
                    startDate: { $gte: startDate, $lt: endDate }
                })


            if (req.user.role === "PHYSICIAN") {
                foundAppoints = await Appointments.aggregate([
                    {
                        $match: {
                            physician: new mongoose.Types.ObjectId(req.user._id as any),
                            startDate: { $gte: startDate, $lt: endDate }
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
                // foundAppoints = await Appointments.find({
                //     physician: req.user._id,
                //     startDate: { $gte: startDate, $lt: endDate }
                // });
            }

            let normalizedAppoints = foundAppoints.map((value: any, index: number) => {
                return {
                    ...value,
                    patientsInfo: value.patientsInfo.pop()
                }
            })

            return res.status(200).send(normalizedAppoints)
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }


    //Lists the appointments of the User making the request
    //  Can be ordered by the startDate of the appointment
    //  Returns the first 15 appointments
    //  To retrieve the remainder of appointments use the "last" http query key with the
    //      date of the last returned appointment
    public async getAppointments(request: Request, res: Response) {
        const req = request as UserRequest;

        let foundAppoints;
        let order = '-startDate'; //Default order descending

        if (req.query.order === "ascending")
            order = '+startDate'
        else if (req.query.order === "descending")
            order = '-startDate'


        //Setup query components
        let patient = { patient: req.user._id };
        let physician = { physician: req.user._id };
        let startDate = { startDate: { $lte: req.query.last } };

        try {
            //Identify which type of user is requesting and proceed
            if (req.user.role === "PATIENT") {
                //Setup query with it's components
                let query = { ...patient }
                if (req.query.last)
                    query = { ...patient, ...startDate }

                foundAppoints = await Appointments.find(query)
                    .limit(3)
                    .sort(order);
            }

            if (req.user.role === "PHYSICIAN") {
                //Setup query with it's components
                let query = { ...physician }
                if (req.query.last)
                    query = { ...physician, ...startDate }

                foundAppoints = await Appointments.find(query)
                    .limit(3)
                    .sort(order);
            }

            return res.status(200).send(foundAppoints)
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }


    public async createAppointment(request: Request, res: Response) {
        const req = request as UserRequest;
        let patient : PatientInterface | null = null;
        let physician: PhysicianInterface | null = null;
        try {
            //When a patient registers an appointment it should be a REQUEST
            if (req.user.role === "PATIENT") {
                req.body.patient = req.user._id;
                req.body.status = "REQUESTED";
                patient = await Patients.findById(req.body.patient, '-password -__v -physicians')
                physician = await Physicians.findById(req.body.physician, '-password -__v -patients')
            }
            //When a physician registers an appointment 
            if (req.user.role === "PHYSICIAN") {
                req.body.physician = req.user._id;
                req.body.status = "ACCEPTED";
                patient = await Patients.findById(req.body.patient, '-password -__v -physicians')
                physician = await Physicians.findById(req.body.physician, '-password -__v -patients')
            }

            const appointment = await Appointments.create(req.body);

            return res.status(200).send(
                {
                    ...(appointment as any)._doc,
                    patientsInfo: patient,
                    physicianInfo: physician
                }
            )
        } catch (error) {
            return res.status(400).send({ error: "" + error })
        }
    }


    public async deleteAppointment(request: Request, res: Response) {
        const req = request as UserRequest;
        let deletedAppoint;
        try {
            if (req.user.role === "PATIENT")
                deletedAppoint = await Appointments.findOneAndDelete({ _id: req.params.appointID, patient: req.user._id });

            if (req.user.role === "PHYSICIAN")
                deletedAppoint = await Appointments.findOneAndDelete({ _id: req.params.appointID, physician: req.user._id });

            return res.status(200).send(deletedAppoint);
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }

    ////////////////////////////////////////////////////////////////////////

    ////// PHYSICIAN APPOINTMENT METHODS

    public async acceptAppoint(request: Request, res: Response) {
        const req = request as UserRequest;
        try {
            const appoint = await Appointments.findByIdAndUpdate({ _id: req.params.appointID, physician: req.user._id }, { status: "ACCEPTED" });

            return res.status(200).send(appoint);
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }


    public async rejectAppointment(request: Request, res: Response) {
        const req = request as UserRequest;
        try {
            const appoint = await Appointments.findOneAndUpdate({ _id: req.params.appointID, physician: req.user._id }, { status: "REJECTED" });

            return res.status(200).send(appoint);
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }

    public async patientAppointments(request: Request, res: Response) {
        const req = request as UserRequest;
        try {
            const appoint = await Appointments.find({
                physician: req.user._id,
                patient: req.params.patientID as unknown as mongoose.Schema.Types.ObjectId
            });

            return res.status(200).send(appoint);
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }

    public async addPatientEval(request: Request, res: Response) {
        const req = request as UserRequest;
        try {
            const appoint = await Appointments.update({ _id: req.params.appointID }, { patientEval: req.params.evalID as unknown as mongoose.Schema.Types.ObjectId });
            if (appoint.nModified > 0)
                return res.status(200).send({ message: "Patient Evaluation added to Appointment" });
            else
                return res.status(400).send({ error: "Appointment does not exist" })
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }

    public async removePatientEval(request: Request, res: Response) {
        const req = request as UserRequest;
        try {
            const appoint = await Appointments.update({ _id: req.params.appointID }, { patientEval: undefined });
            if (appoint.nModified > 0)
                return res.status(200).send({ message: "Patient Evaluation removed from Appointment" });
            else
                return res.status(400).send({ error: "Appointment does not exist" })
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }

}