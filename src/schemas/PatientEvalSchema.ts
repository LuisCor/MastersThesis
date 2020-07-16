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
    medicalPrescription: string,
    numOfTreatments: string,
    treatmentFrequency: string,
    physiotherapists: Array<mongoose.Schema.Types.ObjectId>

};

// Mongo Schema describing a User for the db
export const PatientEvalSchema = new mongoose.Schema(
    {

        creationDate: { type: Date, required: true },
        clinicDiagnosis: {
            type: String,
            enum: [
                "Muscle Rupture",
                "Tendinopathy",
                "Sprain",
                "Fracture",
                "Neuropatic"
            ], required: true
        },
        medicalPrescription: [{ type: String, required: true }], //Can have options limited with enum as well
        numOfTreatments: { type: Number, required: true },
        treatmentFrequency: {
            type: String,
            enum: [
                "Daily",
                "Weekly",
                "Monthly"
            ], required: true
        }, //Review options 
        description: { type: String, required: true },

        physiatrist: { type: Schema.Types.ObjectId, required: true, index: true },
        patient: { type: Schema.Types.ObjectId, required: true, index: true },

        physiotherapists: [{ type: Schema.Types.ObjectId }]
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