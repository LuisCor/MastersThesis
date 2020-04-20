const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UsersSchema = new Schema(
  {
    id: Number,
    username: String,
    password: String,
    name: String,
    email: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("Users", UsersSchema);