import Patients, { PatientInterface } from "../schemas/PatientSchema";
import Physicians, { PhysicianInterface } from "../schemas/PhysicianSchema";
import nodemailer from "nodemailer"
import mongoose from "mongoose"

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.NOREPLY_EMAIL,
        pass: process.env.NOREPLY_EMAIL_PASS
    }
});

export default class UserController {

    constructor() {

    }

    public listUsers() {
        return new Promise((resolve, reject) => {
            Patients.find((err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };


    public async recoverPassword(req: any, res: any) {

        let user: any; //Check the type of this var, it's the result from mongoose.findOne so in therory it's a DocumentQuery
        try {
            switch (req.body.role) {
                case "PATIENT": user = await Patients.findOne({ email: req.body.email });
                    break;
                case "PHYSICIAN": user = await Physicians.findOne({ email: req.body.email });
                    break;
                default: return res.status(400).send({ error: "Role not provided" });
            }
            if(user === null)
                throw Error(`User not found: ${req.body.email}`)
        } catch (err) {
            console.error(err)
            return res.status(400).send({ error: "User not found: " + err })
        }

        try {
            console.log(user)
            user.generatePasswordReset();
            user.save();
            let link = `http://localhost:5000/resetPassword/${user.role}/${user.passwordRecoveryToken}`; //TEMPORARY ADDRESS
            var message = {
                from: process.env.NOREPLY_EMAIL,
                to: user.email,
                subject: "Phyrem - Password Reset",
                text: `Follow this link ${link} to reset your password.`
            };

            transporter.sendMail(message);
            return res.status(200).send({message: "Reset Password email sent"})

        } catch (err) {
            console.error(err)
            return res.status(500).send({ error: "Could not reset password: " + err })
        }
    };

    public async resetPassword(req : any, res : any) {

        let user: any; //Check the type of this var, it's the result from mongoose.findOne so in therory it's a DocumentQuery
        try {
            console.table([req.params.role, req.params.token, req.query.password])
            switch (req.params.role) {
                case "PATIENT": user = await Patients.findOne({ passwordRecoveryToken: req.params.token, passwordRecoveryExpires:{$gt:Date.now()}});
                    break;
                case "PHYSICIAN": user = await Physicians.findOne({ passwordRecoveryToken: req.params.token, passwordRecoveryExpires:{$gt:Date.now()}});
                    break;
                default: return res.status(400).send({ error: "Role not provided" });
            }
            if(user === null)
                throw Error(`Recovery error, token problem`)

        } catch (err) { console.error(err); return res.status(400).send({ error: "" + err })}
        
        try {
            await user.setPassword(req.query.password)
            user.passwordRecoveryToken = undefined;
            user.passwordRecoveryExpires = undefined;
            console.log(user)
            user.save();

            var message = {
                from: process.env.NOREPLY_EMAIL,
                to: user.email,
                subject: "Phyrem - Confirm Password Reset",
                text: `Your password was reset.`
            };

            transporter.sendMail(message);
            return res.status(200).send({ message: "Password was changed" })
        } catch (err) {
            console.error(err)
            return res.status(400).send({ error: "" + err })
        }
    }

}