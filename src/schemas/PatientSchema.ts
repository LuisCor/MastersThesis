import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto"
const Schema = mongoose.Schema;

export interface PatientLoginInterface {
    email: string,
    password: string
}


// TS interface describing a Patient
export interface PatientInterface extends mongoose.Document {
    creationDate: number,
    email: string,
    name: string,
    password: string,
    role: string,
    birthDate: string,
    gender: string,
    phoneNumber: string,
    address: string,
    identificationNum: string,
    fiscalNumber: number,

    job: string,
    healthSystem: string,
    healthSystemNum: string,

    physicians: Array<mongoose.Schema.Types.ObjectId>,

    isValidPassword: Function,
    generatePasswordReset: Function,
    setPassword: Function
};

// Mongo Schema describing a User for the db
export const PatientSchema = new mongoose.Schema(
    {
        creationDate: { type: Number, required: true},
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, required: true },
        birthDate: { type: String, required: true },
        gender: { type: String, required: false },
        phoneNumber: { type: String, required: false },
        address: { type: String, required: true },
        identificationNum: { type: String, required: true, unique: true },
        fiscalNumber: { type: Number, required: true, unique: true },

        job: { type: String, required: false },
        healthSystem: { type: String, required: false },
        healthSystemNum: { type: String, required: false },

        passwordRecoveryToken: {type: String},
        passwordRecoveryExpires: {type: Date},

        physicians: [{ type: Schema.Types.ObjectId, ref: 'Physicians'}]

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
    if(!this.isNew)
        next();

    const patient: PatientInterface = this as PatientInterface;
    const hash = await bcrypt.hash(patient.password, 10);
    patient.password = hash;

    next();

});

//Used to update the password by receiving the new string and hashing it
PatientSchema.methods.setPassword = async function (password : string) {
    const patient: PatientInterface = this as PatientInterface;
    const hash = await bcrypt.hash(password, 10);
    patient.password = hash;
}

//Hashes the password sent by the user for login and checks if the hashed password stored in the
//database matches the one sent. Returns true if it does else false.
PatientSchema.methods.isValidPassword = async function (password: string) {
    const patient = this;
    const compare = await bcrypt.compare(password, patient.password);
    return compare;
}

PatientSchema.methods.generatePasswordReset = function() {
    this.passwordRecoveryToken = crypto.randomBytes(20).toString('hex');
    this.passwordRecoveryExpires = Date.now() + 1800000; //expires in half an hour
};

const Patients = mongoose.model<PatientInterface>('Patients', PatientSchema);
export default Patients;