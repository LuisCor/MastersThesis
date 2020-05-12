import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"
const Schema = mongoose.Schema;

// TS interface describing a Patient
export interface AppointmentInterface extends mongoose.Document {

    startDate: Date,
    endDate: Date,
    location: string,
    status: string, //REQUESTED, DENIED, ACCEPTED
    physician: mongoose.Schema.Types.ObjectId,
    patient: mongoose.Schema.Types.ObjectId

};

// Mongo Schema describing a User for the db
export const AppointmentSchema = new mongoose.Schema(
    {

        startDate: { type: Date, required: true },
        endDate: { type: Date, required: true },
        location: { type: String, required: true },
        status: { type: String, required: true },
        //Patients and physicians are indexed to optimize searches since the most common queries for this 
        //  Schema are going to be filtered by these atributes  
        // Ex: Get Physician's X next appointments  or Does Patient X have appointment at time Y 
        physician: { type: Schema.Types.ObjectId, required: true, index : true },
        patient: { type: Schema.Types.ObjectId, required: true , index : true }

    }
);

AppointmentSchema.pre('validate', async function (next, data) {


    const appointment: AppointmentInterface = this as AppointmentInterface;

    //  This diagram shows the three cases of where a new appointment can overlap with an existing appointment.
    //
    //          a.sD   a.eD         a.sD   a.eD
    //           |--A---|            |--B---|
    //  ------------|-------------------|--------------
    //             sD     |---C---|     eD
    //                   a.sD   a.eD

    try {
        const result = await Appointments.findOne({
            $or: [
                {
                    $and: [
                        { startDate: { $gte: appointment.startDate, $lte: appointment.endDate } },          //Date collision
                        { $or: [{ patient: appointment.patient }, { physician: appointment.physician }] },  //User collision
                        { status: "ACCEPTED" }                                                              //Status collision
                    ]
                },  // Case A
                {
                    $and: [
                        { endDate: { $gte: appointment.startDate, $lte: appointment.endDate } },            //Date collision
                        { $or: [{ patient: appointment.patient }, { physician: appointment.physician }] },  //User collision
                        { status: "ACCEPTED" }                                                              //Status collision
                    ]
                },  // Case B
                {
                    $and: [
                        { $or: [{ startDate: { $lte: appointment.startDate } }, { startDate: { $lte: appointment.endDate } }] },
                        { $or: [{ endDate: { $gte: appointment.startDate } }, { endDate: { $gte: appointment.endDate } }] },        //Date collision
                        { $or: [{ patient: appointment.patient }, { physician: appointment.physician }] },                          //User collision
                        { status: "ACCEPTED" }                                                                                      //Status collision
                    ]
                }, // Case C
            ],
        }, (err, res) => {
            if (!res) {
                next();
            }
            else {
                next(new Error("Patient or Physician occupied"))
            }
        })

    } catch (err) {
        console.error(err)
    }
})

AppointmentSchema.pre('save', async function (next) {

    next();
     
});

const Appointments = mongoose.model<AppointmentInterface>('Appointments', AppointmentSchema);
export default Appointments;