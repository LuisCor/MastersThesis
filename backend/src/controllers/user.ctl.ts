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
                        password: bcrypt.hashSync(newUser.password, 8)
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

    public loginUser = (loginData: UserLoginInterface) => {

        return new Promise((resolve, reject) => {
            Users.findOne({ username: loginData.username })
            .exec((err, user) => {
                //If there's an error retrieving, reject
                if (err) return reject(err);

                //If no user is found, reject
                if (!user) return reject({ message : "User Not found."});

                //If a user exist, confirm password validity
                var passwordIsValid : boolean = bcrypt.compareSync(
                    loginData.password,
                    user.password
                );

                //If not valid, reject
                if (!passwordIsValid) {
                    return reject({message : "Password invalid"});
                }

                //If valid, produce a token to return to the client
                var token = jwt.sign({ id: user.id }, (process.env.JWT_SECRET as string), {
                    expiresIn: 86400 // 24 hours
                });

                return resolve({
                    username : user.username,
                    accessToken : token
                })
            });
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