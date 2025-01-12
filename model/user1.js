const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const moment = require("moment");
// const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your Name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
  },
  phone_number: {
    type: Number,
    required: [true, "Please enter your phone number!"],
  },
  city: {
    type: String,
    required: [true, "Please enter your City!"],
  },
  email_verfied: {
    type: Boolean,
  },
  email_otp: {
    type: Number,
  },
  email_otp_created_at: {
    type: Number,
  },
  phone_number_verified: {
    type: Boolean,
  },
  phone_otp: {
    type: Number,
  },
  phone_otp_created_at: {
    type: Number,
  },
  created_at: {
    type: Number,
    default: moment().unix() * 1000,
  },
});

//  Hash password
// userSchema.pre("save", async function (next) {
//   if (!this.isModified("password")) {
//     next();
//   }

//   this.password = await bcrypt.hash(this.password, 10);
// });

// jwt token
// userSchema.methods.getJwtToken = function () {
//   const payload = {
//     id: this._id,
//     userId: this.user_id,
//     email: this.email,
//     firstName: this.first_name,
//     lastName: this.last_name,
//     phoneNumber: this.phone_number,
//   };
//   return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
//     expiresIn: process.env.JWT_EXPIRES,
//   });
// };

// compare password
// userSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

module.exports = mongoose.model("TUser", userSchema);
