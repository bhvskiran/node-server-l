const express = require("express");
const User = require("../model/user");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");

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
      const { latitude, longitude, addressType, country, state, city, address1, address2, zipCode } = req.body

      if (!(latitude && longitude)) {
        return res.status(400).json({
          msg: `coordinates are missing`,
        });
      }

      if (addressType === null || addressType === undefined || addressType === "") {
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

      const newAddress = latitude && longitude && addressType && {
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
      }

      // add the new address to the array
      user.addresses.push(newAddress);

      await user.save();

      res.status(200).json({
        success: true,
        msg: `${addressType} added successfully`
      });
    } catch (error) {
      return res.status(500).json({
        msg: error.message,
      });
    }
  })
);

module.exports = router;
