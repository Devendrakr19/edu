require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const courseRoute = require('./routes/courseRoute');
const authRoute = require('./routes/authRoute');
require('./utils/db')

const app = express();

// app.use(cors());
const allowedOrigins = ['http://localhost:5173', 'https://knowledge-all-pmbf.onrender.com/'];

app.use(
    cors({
      origin: allowedOrigins,     
      credentials: true,         
    })
  );
 
app.use(cookieParser());

app.use(express.json());

app.use('/user', authRoute)

// Teacher course create
app.use('/course', courseRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Connection successfully on port ${PORT}`);
})