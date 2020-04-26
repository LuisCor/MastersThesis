import Users, { UserInterface, UserLoginInterface } from "../schemas/UsersSchema";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export default class UserController {

    constructor() {

    }


    public listUsers() {
        return new Promise((resolve, reject) => {
            Users.find((err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };


    public listWithRole(searchRole: string) {
        return new Promise((resolve, reject) => {
            Users.find({ role: searchRole }, (err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };


    public profileInfo(username: string) {
        return new Promise((resolve, reject) => {
            Users.find({ username: username }, (err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };

}