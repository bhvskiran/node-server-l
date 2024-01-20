const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Please enter your name!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
  },
  password: {
    type: String,
    required: [true, "Please enter your password"],
    minLength: [6, "Password should be greater than 6 characters"],
    select: false,
  },
  phone_number: {
    type: Number,
    required: [true, "Please enter your phone number!"],
  },
  addresses: [
    {
      country: {
        type: String,
      },
      city: {
        type: String,
      },
      address_1: {
        type: String,
      },
      address_2: {
        type: String,
      },
      zip_code: {
        type: Number,
      },
      address_type: {
        type: String,
      },
    },
  ],
  role: {
    type: String,
    default: "user",
  },
  created_at: {
    type: Date,
    default: Date.now(),
  },
  reset_password_token: String,
  reset_password_time: Date,
});

//  Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }

  this.password = await bcrypt.hash(this.password, 10);
});

// jwt token
userSchema.methods.getJwtToken = function () {
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
