require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const passport = require('passport');
const authRoute = require('./routes/auth');
const cors = require('cors');
const app = express();
const session = require('express-session');

app.use(cors({
  origin: 'http://localhost:3000', 
  credentials: true, 
}));


mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error(err));

app.use(express.json());
app.use(morgan('tiny'));

app.use(session({
  secret: 'googleAuth',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: true, httpOnly: true, sameSite: 'None' } 
}));



app.use(passport.initialize());
app.use(passport.session());

app.use('/auth', authRoute);



app.get("/success", (req, res) => {
  const { token } = req.query; 
  console.log("Redirecting from success with token");

  res.redirect(`http://localhost:3000/?token=${token}`);
});


app.get("/fail", (_req, res) => {
  res.send("Fail");
});



const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
