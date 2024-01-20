const catchAsyncErrors = require("./catchAsyncErrors");
const jwt = require("jsonwebtoken");
const User = require("../model/user");

exports.isAuthenticated = catchAsyncErrors(async (req, res, next) => {
  const { api_token } = req.headers;

  if (!api_token) {
    return res.status(401).json({
      msg: "Please login to continue",
    });
  }

  const decoded = jwt.verify(api_token, process.env.JWT_SECRET_KEY);

  req.user = await User.findById(decoded.id);

  next();
});
