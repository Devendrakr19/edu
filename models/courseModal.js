const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseSchema = new mongoose.Schema(
  {
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
      type: Number,
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
    teacherId: { type: Schema.Types.ObjectId, ref: "Teacher", required: true },
  },
  { timestamps: true }
);

const Course = mongoose.model("course", courseSchema);

module.exports = Course;
