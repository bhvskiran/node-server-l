const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
// const crypto = require("crypto");

const userSchema = new mongoose.Schema({
  service: {
    type: String,
    required: true,
    enum: {
      values: ["phone", "google", "facebook", "apple"],
      message: "`{VALUE}` is not supported"
    }
  },
  user_id: {
    type: String,
    required: [true, "Please enter your userId!"],
  },
  email: {
    type: String,
    required: [true, "Please enter your email address"],
  },
  first_name: {
    type: String,
    required: [true, "Please enter your first name!"],
  },
  last_name: {
    type: String,
    required: [true, "Please enter your last name!"],
  },
  phone_number: {
    type: Number,
    required: [true, "Please enter your phone number!"],
  },

  addresses: [
    {
      coordinates: {
        latitude: { type: mongoose.Schema.Types.Decimal128 },
        longitude: { type: mongoose.Schema.Types.Decimal128 },
      },
      address_type: {
        type: String,
      },
      full_address: {
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
      },
    }
  ],
  gender: {
    type: String
  },
  date_of_birth: {
    type: Date,
  },
  profilePicUrl: {
    type: String
  },
  role: {
    type: String,
    default: "user",
  },
  created_at: {
    type: Date,
    default: Date.now(),
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
userSchema.methods.getJwtToken = function () {
  const payload = {
    id: this._id,
    userId: this.user_id,
    email: this.email,
    firstName: this.first_name,
    lastName: this.last_name,
    phoneNumber: this.phone_number,
  }
  return jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRES,
  });
};

// compare password
// userSchema.methods.comparePassword = async function (enteredPassword) {
//   return await bcrypt.compare(enteredPassword, this.password);
// };

module.exports = mongoose.model("User", userSchema);
