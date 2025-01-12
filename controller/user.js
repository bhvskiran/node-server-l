const express = require("express");
const User = require("../model/user");
const TUser = require("../model/user1");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");
const { sendOTPtoMail } = require("../utils/sendMail");
const moment = require("moment");
const { sendOTPinSMS } = require("../utils/sendSMS");

const router = express.Router();

// API 1: login user
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res) => {
    try {
      const { userId } = req.body;

      if (!userId) {
        return res.status(400).json({
          msg: "Please provide the userId!",
        });
      }

      const user = await User.findOne({ user_id: userId });

      if (!user) {
        return res.status(400).json({
          msg: "User doesn't exists!",
        });
      }

      sendToken(user, 201, res);
    } catch (error) {
      return res.status(500).json({
        msg: error.message,
      });
    }
  })
);

// API 2: create the user
router.post("/create-user", async (req, res) => {
  try {
    const {
      service,
      userId,
      email,
      firstName,
      lastName,
      phoneNumber,
      dateOfBirth,
    } = req.body;
    const user = await User.findOne({ user_id: userId });

    if (user) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    try {
      let user = await User.create({
        service: service,
        user_id: userId,
        email: email,
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        date_of_birth: dateOfBirth,
      });

      sendToken(user, 201, res);
    } catch (error) {
      return res.status(500).json({
        msg: error.message,
      });
    }
  } catch (error) {
    return res.status(400).json({
      msg: error.message,
    });
  }
});

// API 3 - get user
router.get(
  "/get-user/:userId",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const { userId } = req.params;
      const user = await User.findOne({ user_id: userId });

      if (!user) {
        return res.status(400).json({
          msg: "User doesn't exists!",
        });
      }

      res.status(200).json({
        success: true,
        user,
      });
    } catch (error) {
      return res.status(500).json({
        msg: error.message,
      });
    }
  })
);

// API 4 - add address
router.post(
  "/add-address",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id);
      const {
        latitude,
        longitude,
        addressType,
        country,
        state,
        city,
        address1,
        address2,
        zipCode,
      } = req.body;

      if (!(latitude && longitude)) {
        return res.status(400).json({
          msg: `coordinates are missing`,
        });
      }

      if (
        addressType === null ||
        addressType === undefined ||
        addressType === ""
      ) {
        return res.status(400).json({
          msg: `addressType is missing`,
        });
      }

      const sameTypeAddress = user.addresses.find(
        (address) => address.address_type === addressType
      );
      if (sameTypeAddress) {
        return res.status(400).json({
          msg: `${addressType} address already exists`,
        });
      }

      const newAddress = latitude &&
        longitude &&
        addressType && {
          coordinates: {
            latitude: latitude,
            longitude: longitude,
          },
          address_type: addressType,
          full_address: {
            country: country || "",
            state: state || "",
            city: city || "",
            address_1: address1 || "",
            address_2: address2 || "",
            zip_code: zipCode || "",
          },
        };

      // add the new address to the array
      user.addresses.push(newAddress);

      await user.save();

      res.status(200).json({
        success: true,
        msg: `${addressType} added successfully`,
      });
    } catch (error) {
      return res.status(500).json({
        msg: error.message,
      });
    }
  })
);

// ---------------------- TRIVAA -----------------------------------------

// API 5 - add user to trivaa
router.post("/add-user", async (req, res) => {
  try {
    const { name, email, phoneNumber, city } = req.body;
    const user = await TUser.findOne({ email: email });
    if (user && user?.email === email && user?.phone_number === phoneNumber) {
      return res.status(201).json({
        msg: "User already exists",
        id: user?._id,
        email_verfied: user?.email_verfied ? user?.email_verfied : false,
        phone_number_verified: user?.phone_number_verified
          ? user?.phone_number_verified
          : false,
      });
    }

    try {
      let user = await TUser.create({
        name: name,
        email: email,
        phone_number: phoneNumber,
        city: city,
      });

      return res.status(201).json({
        msg: "User added successfully",
        id: user?._id,
        email_verfied: false,
        phone_number_verified: false,
      });
    } catch (error) {
      return res.status(500).json({
        msg: error.message,
      });
    }
  } catch (error) {
    return res.status(400).json({
      msg: error.message,
    });
  }
});

module.exports = router;

// API 6 - get user from trivaa
router.get("/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await TUser.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({
        msg: "User doesn't exists!",
      });
    }

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

const generateOtp = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

// API 7 - send otp to mail
router.post("/:userId/email-otp", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await TUser.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({
        msg: "User doesn't exists!",
      });
    }

    const otp = generateOtp();

    await sendOTPtoMail(user?.email, otp);

    await TUser.findByIdAndUpdate(userId, {
      email_otp: otp,
      email_otp_created_at: moment().unix() * 1000,
    });

    res.status(200).json({
      success: true,
      msg: "Email Verification Sent",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

// API - 8 email verify
router.post("/:userId/email-verify", async (req, res) => {
  try {
    const { userId } = req.params;
    const { otp } = req.body;
    const user = await TUser.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({
        msg: "User doesn't exists!",
      });
    }

    if (user?.email_otp !== otp) {
      return res.status(400).json({
        msg: "OTP isn't correct!",
      });
    }

    const timeWithIn5Min =
      moment().unix() * 1000 - user?.email_otp_created_at < 5 * 60 * 1000;

    if (!timeWithIn5Min) {
      return res.status(400).json({
        msg: "OTP is Expired!",
      });
    }

    await TUser.findByIdAndUpdate(
      userId,
      {
        $set: {
          email_verfied: true,
        },
        $unset: {
          email_otp: 1,
          email_otp_created_at: 1,
        },
      },
      { new: true }
    );

    const updatedUser = await TUser.findOne({ _id: userId });

    res.status(200).json({
      success: true,
      msg: "Email Verification Successfully",
      email_verfied: updatedUser?.email_verfied
        ? updatedUser?.email_verfied
        : false,
      phone_number_verified: updatedUser?.phone_number_verified
        ? updatedUser?.phone_number_verified
        : false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

// API 9 - send otp to phone
router.post("/:userId/phone-otp", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await TUser.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({
        msg: "User doesn't exists!",
      });
    }

    const otp = generateOtp();

    const result = await sendOTPinSMS(user?.phone_number, otp);
    console.log("result otp sms", user?.phone_number, result);

    await TUser.findByIdAndUpdate(userId, {
      phone_otp: otp,
      phone_otp_created_at: moment().unix() * 1000,
    });

    res.status(200).json({
      success: true,
      msg: "Phone Verification Sent",
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});

// API -  phone verify
router.post("/:userId/phone-verify", async (req, res) => {
  try {
    const { userId } = req.params;
    const { otp } = req.body;
    const user = await TUser.findOne({ _id: userId });

    if (!user) {
      return res.status(400).json({
        msg: "User doesn't exists!",
      });
    }

    if (user?.phone_otp !== otp) {
      return res.status(400).json({
        msg: "OTP isn't correct!",
      });
    }

    const timeWithIn5Min =
      moment().unix() * 1000 - user?.phone_otp_created_at < 5 * 60 * 1000;

    if (!timeWithIn5Min) {
      return res.status(400).json({
        msg: "OTP is Expired!",
      });
    }

    await TUser.findByIdAndUpdate(
      userId,
      {
        $set: {
          phone_number_verified: true,
        },
        $unset: {
          phone_otp: 1,
          phone_otp_created_at: 1,
        },
      },
      { new: true }
    );

    const updatedUser = await TUser.findOne({ _id: userId });

    res.status(200).json({
      success: true,
      msg: "Phone Verification Successfully",
      email_verfied: updatedUser?.email_verfied
        ? updatedUser?.email_verfied
        : false,
      phone_number_verified: updatedUser?.phone_number_verified
        ? updatedUser?.phone_number_verified
        : false,
    });
  } catch (error) {
    return res.status(500).json({
      msg: error.message,
    });
  }
});
