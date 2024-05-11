"use strict";

const { Router } = require("express");
const passport = require("passport");
const authRouter = Router();
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
require("../util/passport");

const generateToken = (user) => {
  const payload = { 
    id: user.googleId,
    name: user.name
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

const transporter = nodemailer.createTransport({
  service: 'gmail', 
  auth: {
    user: process.env.EMAIL_USER, 
    pass: process.env.EMAIL_PASS  
  }
});
const sendWelcomeEmail = (email, name) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Welcome to My Project!',
    text: `Hello ${name},\n\nThank you for signing up for my sample Google authentication project. This project was created as part of my practice to enhance my skills as a full-stack developer.\n\nProject Features:\n- Google OAuth integration\n- Secure JWT authentication\n- Session management\n- User data handling with MongoDB\n\nI'm continuously working on adding more features and improving the functionality.\n\nBest Regards,\nGaganjot Singh`
  };
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console.error('Error sending email:', error);
    }
    console.log('Welcome email sent:', info.response);
  });
};




authRouter.get("/google", (req, res, next) => {
  const { redirect_url } = req.query;
  const state = redirect_url ? Buffer.from(JSON.stringify({ redirect_url })).toString("base64") : undefined;
  return passport.authenticate("google", {
    scope: ["profile", "email"],
    state,
  })(req, res, next);
});

authRouter.get("/google/callback", passport.authenticate("google", {
  failureRedirect: "/fail",
  session: false,
}), (req, res) => {
  const token = generateToken(req.user); 
  
  // Send welcome email
  sendWelcomeEmail(req.user.email, req.user.name);

  // Send token in the URL
  res.redirect(`${process.env.FRONTEND_URL || 'https://google-authentication-project-frontend.vercel.app/'}?token=${token}&name=${req.user.name}`);
});

module.exports = authRouter;
