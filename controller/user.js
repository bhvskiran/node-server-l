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
    const { service, userId, email, firstName, lastName, phoneNumber } = req.body;
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
      const { userId } = req.params
      const user = await User.findOne({ user_id: userId});

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
