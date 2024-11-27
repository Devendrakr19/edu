const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema({
  name: {
    type: String,
    trim: true,
  },
  category: {
    type: String,
    trim: true,
  },
  subcategory: {
    type: String,
    trim: true,
  },
  level: {
    type: String,
    trim: true,
  },
  coursetitle: {
    type: String,
    trim: true,
  },
  idpaid: {
    type: String,
    trim: true,
  },
  price: {
    type: String,
  },
  duration: {
    type: String,
  },
  img: {
    type: String,
  },
  comment: {
    type: String,
    trim: true,
  },
});

const Course = mongoose.model("course", courseSchema);

module.exports = Course;
