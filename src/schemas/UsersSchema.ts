import mongoose from "mongoose";
import bcrypt from "bcryptjs"
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
  phone: string,
  isValidPassword: Function
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

//This is called a pre-hook, before the user information is saved in the database
//this function will be called, we'll get the plain text password, hash it and store it.
UserSchema.pre('save', async function(next){
  
  const user : UserInterface = this as UserInterface;
  const hash = await bcrypt.hash(user.password, 10);
  user.password = hash;
  next();
  
});

//Hashes the password sent by the user for login and checks if the hashed password stored in the
//database matches the one sent. Returns true if it does else false.
UserSchema.methods.isValidPassword = async function(password : string){
  const user = this;
  const compare = await bcrypt.compare(password, user.password);
  return compare;
}

const Users = mongoose.model<UserInterface>('Users', UserSchema);
export default Users;