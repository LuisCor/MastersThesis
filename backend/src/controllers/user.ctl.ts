import Users, { UserInterface } from "../schemas/UsersSchema";


export default class UserController {

    constructor() {

    }

    public createUser(newUser: UserInterface) {
        return new Promise((resolve, reject) => {
            Users.countDocuments({ username : newUser.username }, (err, count) => {
                if(count > 0)
                    reject("Username taken");
                else {
                    Users.create(newUser)
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


    public listWithRole(searchRole : string) {
        return new Promise((resolve, reject) => {
            Users.find({ role : searchRole},(err: any, data: any) => {
                if (err)
                    return reject(err);
                return resolve(data);
            });
        });
    };

}