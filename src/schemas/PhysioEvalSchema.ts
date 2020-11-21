import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"
const Schema = mongoose.Schema;

// TS interface describing a Patient
export interface PhysioEvalInterface extends mongoose.Document {

    //Basic document information
    creationDate: Date,
    physiotherapist: mongoose.Schema.Types.ObjectId,
    patient: mongoose.Schema.Types.ObjectId,

    //Subjective exam
    currentState: string,
    previousIssues: string,
    bodyChat: [{ x: number, y: number, intensity: number }],

    //Objective exam
    observations: string,
    articulations: [{ articulation: string, movement: string, adm: string, amplitude: number, endFeel: string }],
    muscles: [{ muscle: string, movement: string, adm: string, intensity: number }],
    perimeter: [{ bodyPart: string, rightMeasure: number, leftMeasure: number, difference: number, reeval1: number, reeval2: number, reevalFinal: number }]
    postural: [{ posture: string, below: number, above: number }],
    functionalExam: string


};

// Mongo Schema describing a User for the db
export const PhysioEvalSchema = new mongoose.Schema(
    {

        //Basic document information
        creationDate: { type: Date, required: true },
        physiotherapist: { type: Schema.Types.ObjectId, required: true, index: true },
        patient: { type: Schema.Types.ObjectId, required: true, index: true },

        //Subjective exam
        currentState: { type: String },
        previousIssues: { type: String },
        bodyChat: {
            x: { type: Number },
            y: { type: Number },
            intensity: { type: Number }
        },

        //Objective exam
        observations: { type: String },
        articulations: [
            {
                articulation: { type: String },
                movement: { type: String },
                adm: { type: String },
                amplitude: { type: Number },
                endFeel: { type: String }
            }
        ],

        muscles: [
            {
                muscle: { type: String },
                movement: { type: String },
                adm: { type: String },
                intensity: { type: Number },
            }
        ],
        perimeter: [
            {
                bodyPart: { type: String },
                rightMeasure: { type: Number },
                leftMeasure: { type: Number },
                difference: { type: Number },
                reeval1: { type: Number },
                reeval2: { type: Number },
                reevalFinal: { type: Number }
            }
        ],

        postural: [
            {
                posture: { type: String },
                below: { type: Number },
                above: { type: Number }
            }
        ],

        functionalExam: { type: String }
    }
);

PhysioEvalSchema.pre('validate', async function (next, data) {

    next();

})

PhysioEvalSchema.pre('save', async function (next) {

    next();

});

const PhysioEvals = mongoose.model<PhysioEvalInterface>('PhysioEvals', PhysioEvalSchema);
export default PhysioEvals;