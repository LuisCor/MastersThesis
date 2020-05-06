import mongoose from "mongoose";
import bcrypt from "bcryptjs"
const Schema = mongoose.Schema;

export interface AdminLoginInterface {
    email: string,
    password: string
}


// TS interface describing a Patient
export interface AdminInterface extends mongoose.Document {
    email: string,
    name: string,
    password: string,
    role: string,

    isValidPassword: Function
};

// Mongo Schema describing a User for the db
export const AdminSchema = new mongoose.Schema(
    {
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, required: true }
    }
);


AdminSchema.pre('validate', function (next, data) {

    const user: AdminInterface = this as AdminInterface;
    Admin.findOne({ username: user.email }, (err, res) => {
        if (!res)
            next();
        else {
            next(new Error("Admin already registered"))
        }
    })

})

//This is called a pre-hook, before the user information is saved in the database
//this function will be called, we'll get the plain text password, hash it and store it.
AdminSchema.pre('save', async function (next) {

    const patient: AdminInterface = this as AdminInterface;
    const hash = await bcrypt.hash(patient.password, 10);
    patient.password = hash;
    next();

});

//Hashes the password sent by the user for login and checks if the hashed password stored in the
//database matches the one sent. Returns true if it does else false.
AdminSchema.methods.isValidPassword = async function (password: string) {
    const patient = this;
    const compare = await bcrypt.compare(password, patient.password);
    return compare;
}

const Admin = mongoose.model<AdminInterface>('Admins', AdminSchema);
export default Admins;