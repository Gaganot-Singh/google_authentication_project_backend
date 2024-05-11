"use strict";

const { Router } = require("express");
const passport = require("passport");
const authRouter = Router();
const jwt = require("jsonwebtoken");
require("../util/passport");

const generateToken = (user) => {
  const payload = { 
    id: user.id,
    name: user.name
  };
  return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '1d' });
};

authRouter.get("/google", (req, res, next) => {
  const { redirect_url } = req.query;
  const state = redirect_url ? Buffer.from(JSON.stringify({ redirect_url })).toString("base64") : undefined;
  return passport.authenticate("google", {
    scope: ["profile"],
    state,
  })(req, res, next);
});

authRouter.get("/google/callback", passport.authenticate("google", {
  failureRedirect: "/fail",
  session: false,
}), (req, res) => {
  const token = generateToken(req.user); 
  // Send token in the URL
  res.redirect(`${process.env.FRONTEND_URL || 'https://google-authentication-project-frontend.vercel.app/'}?token=${token}&name=${req.user.name}`);
});

module.exports = authRouter;
