import Users, { UserInterface, UserLoginInterface } from "../schemas/UsersSchema";
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'


export default class UserController {

    constructor() {

    }

    public createUser(newUser: UserInterface) {
        return new Promise((resolve, reject) => {
            Users.countDocuments({ username: newUser.username }, (err, count) => {
                if (count > 0)
                    reject("Username taken");
                else {
                    let treatedUser = {
                        ...newUser,
                        // bcrypt hash second algorithm is the num of iterations on the salt, default is 10
                        password: bcrypt.hashSync(newUser.password, 11)
                    }


                    console.log("--> DEBUG: CREATING USER: ", treatedUser)
                    console.log("--> Original password: ", newUser.password)
                    console.log("--> Treated password: ", treatedUser.password)


                    Users.create(treatedUser)
                        .then(() => resolve())
                        .catch((err) => reject(err))
                }
            })
        });
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

}