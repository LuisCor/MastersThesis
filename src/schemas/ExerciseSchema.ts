import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"
const Schema = mongoose.Schema;

// TS interface describing a Patient
export interface ExerciseInterface extends mongoose.Document {

    creationDate: Date,
    patient: mongoose.Schema.Types.ObjectId,

};

// Mongo Schema describing a User for the db
export const ExerciseSchema = new mongoose.Schema(
    {

        creationDate: { type: Date, required: true },
        patient: { type: Schema.Types.ObjectId, required: true, index: true },
    }
);

ExerciseSchema.pre('validate', async function (next, data) {

    next();

})

ExerciseSchema.pre('save', async function (next) {

    next();

});

const Exercises = mongoose.model<ExerciseInterface>('Exercises', ExerciseSchema);
export default Exercises;