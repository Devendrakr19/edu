require("dotenv").config();
const express = require("express");
const cors = require("cors");
const session = require('express-session');
const passport = require("passport");
const cookieParser = require("cookie-parser");
const courseRoute = require("./routes/courseRoute");
const authRoute = require("./routes/authRoute");
require("./utils/db");

const app = express();

// app.use(cors());
const allowedOrigins = [
  "http://localhost:5173",
  "https://knowledge-all-kn0s.onrender.com",
];

// const sessionSecret = process.env.SESSION_SECRET;

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

// app.use(
//   session({
//     secret: sessionSecret, // Use a secure session secret
//     resave: false,
//     saveUninitialized: true,
//     cookie: { secure: process.env.NODE_ENV === "production", httpOnly: true },
//   })
// );

// app.use(passport.initialize());
// app.use(passport.session());

app.use(cookieParser());

app.use(express.json());

app.use("/user", authRoute);

// Teacher course create
app.use("/course", courseRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`Connection successfully on port ${PORT}`);
});
