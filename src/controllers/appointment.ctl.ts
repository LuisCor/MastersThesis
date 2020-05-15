import Appointments from "../schemas/AppointmentSchema";
import { Request, Response } from 'express';
import { UserRequest } from "../auth/auth"
import mongoose, { connect, Query } from "mongoose";
import Performance from "perf_hooks"

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
                foundAppoints = await Appointments.find({
                    patient: req.user._id,
                    startDate: { $gte: todayStart, $lt: todayEnd }
                });

            if (req.user.role === "PHYSICIAN")
                foundAppoints = await Appointments.find({
                    patient: req.user._id,
                    startDate: { $gte: todayStart, $lt: todayEnd }
                });

            return res.status(200).send(foundAppoints)
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }

    public async getAppointmentsBetween(request: Request, res: Response) {
        const req = request as UserRequest;

        let foundAppoints;
        let startDate = new Date(req.query.startDate as string)
        let endDate = new Date(req.query.endDate as string)


        try {
            if (req.user.role === "PATIENT")
                foundAppoints = await Appointments.find({
                    patient: req.user._id,
                    startDate: { $gte: startDate, $lt: endDate }
                })
                

            if (req.user.role === "PHYSICIAN")
                foundAppoints = await Appointments.find({
                    patient: req.user._id,
                    startDate: { $gte: startDate, $lt: endDate }
                });

            return res.status(200).send(foundAppoints)
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
                
        if(req.query.order === "ascending")
            order = '+startDate'
        else if(req.query.order === "descending")
            order = '-startDate'


        //Setup query components
        let patient = { patient: req.user._id }; 
        let physician = { physician: req.user._id };
        let startDate = { startDate: {$lte: req.query.last}};

        try {
            //Identify which type of user is requesting and proceed
            if (req.user.role === "PATIENT") {
                //Setup query with it's components
                let query = {...patient}
                if(req.query.last)
                    query = {...patient, ...startDate}
                
                foundAppoints = await Appointments.find(query)
                .limit( 3 )
                .sort( order );
            }

            if (req.user.role === "PHYSICIAN"){
                //Setup query with it's components
                let query = {...physician}
                if(req.query.last)
                    query = {...physician, ...startDate}
                
                foundAppoints = await Appointments.find(query)
                .limit( 3 )
                .sort( order );
            }

            return res.status(200).send(foundAppoints)
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }


    public async createAppointment(request: Request, res: Response) {
        const req = request as UserRequest;
        try {
            //When a patient registers an appointment it should be a REQUEST
            if (req.user.role === "PATIENT") {
                req.body.patient = req.user._id;
                req.body.status = "REQUESTED";
            }
            //When a physician registers an appointment 
            if (req.user.role === "PHYSICIAN") {
                req.body.physician = req.user._id;
                req.body.status = "ACCEPTED";
            }

            const appointment = await Appointments.create(req.body);
            return res.status(200).send({ appointmentID: appointment._id })
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
            const appoint = await Appointments.findByIdAndUpdate({ _id: req.params.appointID, physician: req.user._id }, { status: "ACCEPT" });

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

}