import Appointments from "../schemas/AppointmentSchema";
import { Request, Response } from 'express';
import mongoose, { connect, Query } from "mongoose";
import Performance from "perf_hooks"

export default class AppointmentSchema {

    constructor() {

    }


    public async listAppointments(req: Request, res: Response) {

        try {
            const allAppointments = await Appointments.find();
            return res.status(200).send(allAppointments)
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }


    public async getUserAppointments(req: any, res: any) {

        let foundAppoints;
        try {
            if(req.user.role === "PATIENT")
               foundAppoints = await Appointments.find({patient : req.user._id});
            else if(req.user.role === "PHYSICIAN")
               foundAppoints  = await Appointments.find({physician : req.user._id});
            else throw Error("Unknown user role")

            console.log(foundAppoints)
            return res.status(200).send(foundAppoints)
        } catch (error) {
            return res.status(400).send({ error: "An error occured " + error })
        }
    }

    public async createAppointment(req: any, res: any) {
        try {
            if (req.user.role === "PATIENT")
                req.body.status = "REQUESTED";

            if (req.user.role === "PHYSICIAN")
                req.body.status = "ACCEPTED";

            const appointment = await Appointments.create(req.body);
            return res.status(200).send({appointmentID: appointment._id})
        } catch(error) {
            return res.status(400).send({error: "" + error})
        }
    }


}