const express = require("express");
const User = require("../model/user");
const catchAsyncErrors = require("../middleware/catchAsyncErrors");
const sendToken = require("../utils/jwtToken");
const { isAuthenticated } = require("../middleware/auth");

const router = express.Router();

// API 1: create the user
router.post("/create-user", async (req, res) => {
  try {
    const { name, email, password, phoneNumber } = req.body;
    const userEmail = await User.findOne({ email });

    if (userEmail) {
      return res.status(400).json({
        msg: "User already exists",
      });
    }

    try {
      let user = await User.create({
        name: name,
        email: email,
        password: password,
        phone_number: phoneNumber,
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

// API 2: login user
router.post(
  "/login-user",
  catchAsyncErrors(async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          msg: "Please provide the all fields!",
        });
      }

      const user = await User.findOne({ email }).select("+password");

      if (!user) {
        return res.status(400).json({
          msg: "User doesn't exists!",
        });
      }

      const isPasswordValid = await user.comparePassword(password);
      if (!isPasswordValid) {
        return res.status(400).json({
          msg: "Please provide the correct information",
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

// API 3 - get user
router.get(
  "/get-user",
  isAuthenticated,
  catchAsyncErrors(async (req, res, next) => {
    try {
      const user = await User.findById(req.user.id).select("-password");

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

module.exports = router;
