import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const Schema = mongoose.Schema;

export interface PhysicianLoginInterface {
    email: string,
    password: string
}


// TS interface describing a Patient
export interface PhysicianInterface extends mongoose.Document {
    email: string,
    name: string,
    password: string,
    role: string,
    gender: string,
    birthDate: string,
    physicianID: string
    phoneNumber: number,

    isValidPassword: Function
};

// Mongo Schema describing a User for the db
export const PhysicianSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true},
        password: { type: String, required: true},
        role: { type: String, required: true},
        gender: { type: String, required: true},
        birthDate: { type: String, required: true},
        physicianID: { type: String, required: true},
        phoneNumber: { type: Number, required: true}
    }
);


PhysicianSchema.pre('validate', function (next, data) {

    const user: PhysicianInterface = this as PhysicianInterface;
    Physicians.findOne({ username: user.email }, (err, res) => {
        if (!res)
            next();
        else {
            next(new Error("Patient already registered"))
        }
    })

})

//This is called a pre-hook, before the user information is saved in the database
//this function will be called, we'll get the plain text password, hash it and store it.
PhysicianSchema.pre('save', async function (next) {

    const patient: PhysicianInterface = this as PhysicianInterface;
    const hash = await bcrypt.hash(patient.password, 10);
    patient.password = hash;
    next();

});

//Hashes the password sent by the user for login and checks if the hashed password stored in the
//database matches the one sent. Returns true if it does else false.
PhysicianSchema.methods.isValidPassword = async function (password: string) {
    const patient = this;
    const compare = await bcrypt.compare(password, patient.password);
    return compare;
}

const Physicians = mongoose.model<PhysicianInterface>('Physicians', PhysicianSchema);
export default Physicians;