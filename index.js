require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const studentRoute = require('./routes/studentRoute');
const teacherRoute = require('./routes/teacherRoute');
require('./utils/db')

const app = express();

app.use(cors());
app.use(express.json());

app.use('/student', studentRoute);
app.use('/teacher', teacherRoute)

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
    console.log(`Connection successfully on port ${PORT}`);
})