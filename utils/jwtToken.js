// create token and saving that in cookies
const sendToken = (user, statusCode, res) => {
  const token = user.getJwtToken();

  // Options for cookies
  const options = {
    expires: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
    httpOnly: true,
  };

  const userWithoutPassword = {
    id: user?._id,
    name: user?.name,
    email: user?.email,
    phone_number: user?.phone_number,
    role: user?.role,
    created_at: user?.created_at,
    addresses: user?.addresses,
  };

  res.status(statusCode).json({
    success: true,
    user: userWithoutPassword,
    token,
  });
};

module.exports = sendToken;
