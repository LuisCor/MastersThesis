import mongoose, { connect } from "mongoose";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { PhysicianRequest } from "../auth/auth";
import { Request } from "express";
const Schema = mongoose.Schema;

export interface PhysicianLoginInterface {
    email: string,
    password: string
}


// TS interface describing a Physician
export interface PhysicianInterface extends mongoose.Document {
    creationDate: number,
    email: string,
    name: string,
    password: string,
    role: string,
    specialty: string,

    birthDate: string,
    gender: string,
    phoneNumber: string,

    physicianID: string

    patients: Array<mongoose.Schema.Types.ObjectId>

    isValidPassword: Function,
    generatePasswordReset: Function,
    setPassword: Function
};

// Mongo Schema describing a User for the db
export const PhysicianSchema = new mongoose.Schema(
    {
        creationDate: { type: Number, required: true },
        email: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        password: { type: String, required: true },
        role: { type: String, required: true },
        specialty: [{ type: String, enum: ["PHYSIOTHERAPIST", "PHYSIATRIST"], required: true }],

        birthDate: { type: String, required: true },
        gender: { type: String, required: true },
        phoneNumber: { type: String, required: true },

        physicianID: { type: String, required: true, unique: true },

        patients: [{ type: Schema.Types.ObjectId, ref: 'Patients' }]
    }
);


PhysicianSchema.pre('validate', function (next, data) {

    const user: PhysicianInterface = this as PhysicianInterface;
    Physicians.findOne({ username: user.email }, (err, res) => {
        if (!res)
            next();
        else {
            next(new Error("Physician already registered"))
        }
    })

})

//This is called a pre-hook, before the user information is saved in the database
//this function will be called, we'll get the plain text password, hash it and store it.
PhysicianSchema.pre('save', async function (next) {
    if (!this.isNew)
        next();

    const physician: PhysicianInterface = this as PhysicianInterface;
    const hash = await bcrypt.hash(physician.password, 10);
    physician.password = hash;

    next();

});

//Used to update the password by receiving the new string and hashing it
PhysicianSchema.methods.setPassword = async function (password: string) {
    const physician: PhysicianInterface = this as PhysicianInterface;
    const hash = await bcrypt.hash(password, 10);
    physician.password = hash;
}

//Hashes the password sent by the user for login and checks if the hashed password stored in the
//database matches the one sent. Returns true if it does else false.
PhysicianSchema.methods.isValidPassword = async function (password: string) {
    const physician = this;
    const compare = await bcrypt.compare(password, physician.password);
    return compare;
}

PhysicianSchema.methods.generatePasswordReset = function () {
    this.passwordRecoveryToken = crypto.randomBytes(20).toString('hex');
    this.passwordRecoveryExpires = Date.now() + 1800000; //expires in half an hour
};

export function specialtyAuthorization(specialties: Array<String>) {
    return function (request: Request, res: any, next: any) {
        //Request at this point comes from passport.authenticate so it's the object
        // "user" : {_id:--, role: --}
        let req = request as PhysicianRequest;
        let user = req.user;

        if(user.role !== "PHYSICIAN")
            next();

        if (!user.specialty)
            return res.status(401).send({ error: "Specialty not provided" })


        for (let i = 0; i < user.specialty.length; i++) {
                switch (user.specialty[i]) {
                    case "PHYSIOTHERAPIST":
                        if (specialties.indexOf("PHYSIOTHERAPIST") > -1)
                            return next();
                        break;
                    case "PHYSIATRIST":
                        if (specialties.indexOf("PHYSIATRIST") > -1)
                            return next();
                        break;
                }
        }

        return res.status(401).send({ error: "Not Authorized to Create/View content" })
    }
}

const Physicians = mongoose.model<PhysicianInterface>('Physicians', PhysicianSchema);
export default Physicians;