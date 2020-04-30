import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const Schema = mongoose.Schema;

export interface PatientLoginInterface {
    email: string,
    password: string
}


// TS interface describing a Patient
export interface PatientInterface extends mongoose.Document {
    email: string,
    name: string,
    password: string,
    role: string,
    birthDate: string,
    address: string,
    identificationNum: string,
    fiscalNumber: number,

    job: string,
    gender: string,
    phoneNumber: number,
    healthSystem: string,
    healthSystemNum: string,

    isValidPassword: Function
};

// Mongo Schema describing a User for the db
export const PatientSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, required: true },
        birthDate: { type: String, required: true },
        address: { type: String, required: true },
        identificationNum: { type: String, required: true, unique: true },
        fiscalNumber: { type: Number, required: true, unique: true },

        job: { type: String, required: false },
        gender: { type: String, required: false },
        phoneNumber: { type: Number, required: false },
        healthSystem: { type: String, required: false },
        healthSystemNum: { type: String, required: false },

    }
);


PatientSchema.pre('validate', function (next, data) {

    const user: PatientInterface = this as PatientInterface;
    Patients.findOne({ username: user.email }, (err, res) => {
        if (!res)
            next();
        else {
            next(new Error("Patient already registered"))
        }
    })

})

//This is called a pre-hook, before the user information is saved in the database
//this function will be called, we'll get the plain text password, hash it and store it.
PatientSchema.pre('save', async function (next) {

    const patient: PatientInterface = this as PatientInterface;
    const hash = await bcrypt.hash(patient.password, 10);
    patient.password = hash;
    next();

});

//Hashes the password sent by the user for login and checks if the hashed password stored in the
//database matches the one sent. Returns true if it does else false.
PatientSchema.methods.isValidPassword = async function (password: string) {
    const patient = this;
    const compare = await bcrypt.compare(password, patient.password);
    return compare;
}

const Patients = mongoose.model<PatientInterface>('Patients', PatientSchema);
export default Patients;