const mongoose = require('mongoose');

const signupSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    mobile: {
        type: String,
        trim: true,
    },
    password: {
        type: String,
        // required: true,
    },
    role:{
        type: String,
        enum: ["Student", "Teacher"],
    }
})

const Signup = mongoose.model("Signup", signupSchema);

module.exports = Signup;