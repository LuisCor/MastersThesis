import jwt from "jsonwebtoken";
import Users from "../schemas/UsersSchema"
const secret : string = process.env.JWT_SECRET as string;
console.log("--> DEBUG: Using secret: ", secret)

export default class Authentication {

    constructor() {

    }

    public verifyToken = (req : any, res : any, next : any) => {
        let token = req.headers["x-access-token"];

        if (!token) {
            return res.status(403).send({ message: "No token provided!" });
        }

        jwt.verify(token, secret, (err : any, decoded : any) => {
            if (err) {
                return res.status(401).send({ message: "Unauthorized!" });
            }
            req.userId = decoded.id;
            next();
        });
    };
}