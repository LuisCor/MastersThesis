import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"
const Schema = mongoose.Schema;

// TS interface describing a Patient
export interface PatientEvalInterface extends mongoose.Document {

    creationDate: Date,
    physiatrist: mongoose.Schema.Types.ObjectId, //Physiatrist, 
    patient: mongoose.Schema.Types.ObjectId,

    clinicDiagnosis: string,
    description: string,
    medicalPrescription: PrescriptionInterface[]
    //physiotherapists: Array<mongoose.Schema.Types.ObjectId>

};

export interface PrescriptionInterface extends mongoose.Document {
    prescription: string,
    prescriptionOption : string[],
    numOfTreatments : number,
    treatmentFreq : string
}


// Mongo Schema describing a User for the db
export const PatientEvalSchema = new mongoose.Schema(
    {

        creationDate: { type: Date, required: true },
        physiatrist: { type: Schema.Types.ObjectId, required: true, index: true },
        patient: { type: Schema.Types.ObjectId, required: true, index: true },

        clinicDiagnosis: { type: String, required: true},
        description: { type: String, required: true },
        medicalPrescription: [
            {
                prescription: { type: String},
                prescriptionOption : [{ type: String}],
                numOfTreatments : { type: Number},
                treatmentFreq : { type: String }
            }
        ]

        //physiotherapists: [{ type: Schema.Types.ObjectId }]
    }
);

PatientEvalSchema.pre('validate', async function (next, data) {

    next();

})

PatientEvalSchema.pre('save', async function (next) {

    next();

});

const PatientEvals = mongoose.model<PatientEvalInterface>('PatientEvals', PatientEvalSchema);
export default PatientEvals;