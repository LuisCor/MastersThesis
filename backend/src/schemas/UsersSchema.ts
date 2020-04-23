import mongoose from "mongoose";
const Schema = mongoose.Schema;

export interface UserLoginInterface {
  username: string,
  password: string
}


// TS interface describing a User
export interface UserInterface extends mongoose.Document {
  username: string,
  password: string,
  name: string,
  role: string,
  address: string,
  email: string,
  phone: string
};

// Mongo Schema describing a User for the db
export const UserSchema = new mongoose.Schema(
  {

    username: {type: String, required: true},
    password: {type: String, required: true},
    name: {type: String, required: true},
    role: {type: String, required: true},
    address: {type: String, required: true},
    email: {type: String, required: true},
    phone: {type: String, required: true},

  }
);

const Users = mongoose.model<UserInterface>('Users', UserSchema);
export default Users;