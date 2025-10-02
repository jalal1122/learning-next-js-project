import nodemailer from "nodemailer";

const sendVerificationEmail = (type: string, email: string, token: string) => {
  // Create a transporter object using SMTP transport
  // Looking to send emails in production? Check out our Email API/SMTP product!
  const transport = nodemailer.createTransport({
    host: "sandbox.smtp.mailtrap.io",
    port: 2525,
    auth: {
      user: process.env.MAILTRAP_USER!,
      pass: process.env.MAILTRAP_PASSWORD!,
    },
  });

  const mailOptions = {
    from: '"MJDEVSTUDIO" <no-reply@MJDEVSTUDIO.com>',
    to: email,
    subject: type === "verify" ? "Verify your email" : "Reset your password",
    text:
      type === "verify"
        ? `Please verify your email by clicking the following link: ${process.env.DOMAIN}/verifytoken/${token}`
        : `Please reset your password by clicking the following link: ${process.env.DOMAIN}/forgotpassword/${token}`,
    html:
      type === "verify"
        ? `<p>Please verify your email by clicking the following link:</p><p>${process.env.DOMAIN}/verifytoken/${token} <hr/><a href="${process.env.DOMAIN}/verifytoken/${token}">Verify Email</a></p>`
        : `<p>Please reset your password by clicking the following link:</p><p>${process.env.DOMAIN}/forgotpassword/${token} <hr/><a href="${process.env.DOMAIN}/forgotpassword/${token}">Reset Password</a></p>`,
  };

  transport.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error("Error sending verification email:", error);
    }
    console.log("Verification email sent:", info.response);
  });
};

export default sendVerificationEmail;
