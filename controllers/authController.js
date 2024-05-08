const passport = require('passport');


authRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/fail" }),
  (req, res) => {
    const token = jwt.sign({ id: req.user._id }, process.env.JWT_SECRET);

    res.redirect(`/succss?token=${token}`);
  }
);