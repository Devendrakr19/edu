const mongoose = require("mongoose");
const { Schema } = mongoose;

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: true
    },
    category: {
      type: String,
      trim: true,
      required: true
    },
    subcategory: {
      type: String,
      trim: true,
      required: true
    },
    level: {
      type: String,
      trim: true,
      required: true
    },
    coursetitle: {
      type: String,
      trim: true,
      required: true
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
    userId: { type: Schema.Types.ObjectId, required: true },
  },
  { timestamps: true }
);

const Course = mongoose.model("course", courseSchema);

module.exports = Course;
