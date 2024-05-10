const passportJWT = require('passport-jwt');
const JWTStrategy = passportJWT.Strategy;
const ExtractJWT = passportJWT.ExtractJwt;
const GoogleStrategy = require("passport-google-oauth20");
const passport = require("passport");
const User = require("../models/User");

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET, GOOGLE_CALLBACK_URL, JWT_SECRET } = process.env;

passport.use(new GoogleStrategy({
    clientID: GOOGLE_CLIENT_ID,
    clientSecret: GOOGLE_CLIENT_SECRET,
    callbackURL: GOOGLE_CALLBACK_URL,
  },
  async (_accessToken, _refreshToken, profile, cb) => {
    try {
      const user = await User.findOneAndUpdate(
        { googleId: profile.id },
        { name: profile.displayName, googleId: profile.id },
        { upsert: true, new: true }
      );
      return cb(null, user);
    } catch (error) {
      return cb(error);
    }
  }
));

passport.use(new JWTStrategy({
  jwtFromRequest: ExtractJWT.fromAuthHeaderAsBearerToken(),
  secretOrKey: JWT_SECRET
}, async (jwtPayload, done) => {
  try {
    const user = await User.findById(jwtPayload.id); 
    if (!user) {
      return done(null, false, { message: 'User not found' }); 
    }
    return done(null, user);
  } catch (error) {
    return done(error, false); 
  }
}));

module.exports.isAuthenticated = (req, res, next) => {
  passport.authenticate('jwt', { session: false }, (err, user, info) => {
    if (err) {
      return next(new Error('Authentication error: ' + err.message)); 
    }
    if (!user) {
      return res.status(401).json({ message: info.message || 'No user found' }); 
    }
    req.user = user; 
    next(); 
  })(req, res, next);
};
