const fast2sms = require("fast-two-sms");

const sendOTPinSMS = async (number, otp) => {
  try {
    const res = await fast2sms.sendMessage({
      authorization: process.env.FAST2SMS_API_KEY,
      message: `Hi, \nYour Trivaa Phone verification OTP is ${otp}. Please do not share it with anyone.\nTeam Trivaa`,
      numbers: [number],
    });
    return res;
  } catch (error) {
    return error;
  }
};

const sendSMS = async (number, message) => {
  try {
    const res = await fast2sms.sendMessage({
      authorization: process.env.FAST2SMS_API_KEY,
      message: message,
      numbers: [number],
    });
    return res;
  } catch (error) {
    return error;
  }
};

exports.sendOTPinSMS = sendOTPinSMS;
exports.sendSMS = sendSMS;
