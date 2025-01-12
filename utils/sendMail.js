const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  secure: true,
  host: "smtp.gmail.com",
  port: 465,
  auth: {
    user: process.env.GMAIL_ID,
    pass: process.env.GMAIL_PASS, // look down to generate pass key steps
  },
});

// pass key generation steps -
// 1. gmail -> manage your google account -> left side - security -> make sure you turned on 2 step verification
// 2. search for app passwords and click on it
// 3. name of the project, and go, so that it will generate the new pass key

const sendOTPtoMail = async (email, otp) => {
  try {
    const mailOptions = {
      from: `Verification <${process.env.GMAIL_ID}>`,
      to: email,
      subject: "Verify your email",
      // html: `Your OTP is ${otp}.\nDo not share with anyone`,
      html: `<div>
              <p>Hi,</p>
              <p>Your Trivaa Email verification OTP is ${otp}. Please do not share it with anyone.</p>
              <p>Team Trivaa</p>
            </div>`,
    };

    const results = await transporter.sendMail(mailOptions, (error, info) => {
      console.log(info);
    });
    return results;
  } catch (error) {
    return error;
  }
};

const sendMail = async (email, subject, body, fromContext = "") => {
  try {
    const mailOptions = {
      from: `${fromContext} <${process.env.GMAIL_ID}>`,
      to: email,
      subject: subject,
      html: body,
    };

    const results = await transporter.sendMail(mailOptions, (error, info) => {
      console.log(info);
    });
    return results;
  } catch (error) {
    return error;
  }
};

exports.sendOTPtoMail = sendOTPtoMail;
exports.sendMail = sendMail;
