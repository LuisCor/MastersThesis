import Patients from "../schemas/PatientSchema";

//TODO : This class


export default class AdminController {

    constructor() {

    }

    public profileInfo(id: string, role: string) {
        return new Promise((resolve, reject) => {
            if (role === "PATIENT") {
                Patients.find({ _id: id }, (err: any, data: any) => {
                    if (err)
                        return reject(err);
                    return resolve(data);
                });
            } else if (role === "PHYSICIAN") {
                Patients.find({ _id: id }, (err: any, data: any) => {
                    if (err)
                        return reject(err);
                    return resolve(data);
                });
            }
            return reject("Incorrect role");
        });
    };
}