require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoute = require('./routes/studentRoute');
const teacherRoute = require('./routes/teacherRoute');
const courseRoute = require('./routes/courseRoute');
require('./utils/db')

const app = express();

app.use(cors());
app.use(express.json());

// teacher and student login and signup 
app.use('/student', studentRoute);
app.use('/teacher', teacherRoute)

// Teache course create
app.use('/course', courseRoute);

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Connection successfully on port ${PORT}`);
})