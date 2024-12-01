const express = require("express");
const router = express.Router();
const Course = require("../models/courseModal");
const multer = require("multer");
const path = require("path");
const courseMiddleware = require("../middleware/courseAuthMiddleware");
const cloudinary = require("../server/cloudinary");
const fs = require("fs");
const Signup = require("../models/authModal");

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "imgstored");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  if (
    file.mimetype === "image/jpeg" ||
    file.mimetype === "image/png" ||
    file.mimetype === "image/gif"
  ) {
    cb(null, true);
  } else {
    cb(new Error("Invalid file type. Only JPEG, PNG, or GIF allowed."), false);
  }
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
});

router.post(
  "/create-course",
  courseMiddleware,
  upload.single("file"),
  async (req, res) => {
    try {
      const {
        name,
        category,
        subcategory,
        level,
        coursetitle,
        idpaid,
        price,
        duration,
        comment,
      } = req.body;
 
      let img = null;
      if (req.file) {
        const result = await cloudinary.uploader.upload(req.file.path, {
          folder: "courses",
        });
        img = result.secure_url;
      }

      let coursprice = price && price !== "0" ? price : 0;

      const course = new Course({
        name,
        category,
        subcategory,
        level,
        coursetitle,
        idpaid,
        price: coursprice,
        duration,
        img,
        comment,
        userId: req.userId,
      });

      await course.save();

      if (req.file) {
        fs.unlinkSync(req.file.path);
      }

      return res.status(201).json({
        message: "Course Create successfully.",
        userId: course.userId,
        name: course.name,
        category: course.category,
        subcategory: course.subcategory,
        level: course.level,
        coursetitle: course.coursetitle,
        idpaid: course.idpaid,
        price: course.price,
        duration: course.duration,
        img: course.img,
        comment: course.comment,
      });
    } catch (error) {
      res.status(500).json({ message: "Internal server error" });
    }
  }
);

router.get("/get-course", courseMiddleware, async (req, res) => {
  try {
    const courses = await Course.find({ userId: req.userId });

    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

// Show all courses
router.get("/get-all-course", async (req, res) => {
  try {
    const courses = await Course.find();

    res.status(200).json({ courses });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});

router.delete("/delete-course/:id", async (req, res) => {
  try {
    const courseId = req.params.id;

    const course = await Course.findById(courseId);

    if (course.img) {
      const publicId = course.img.split("/").slice(-2).join("/").split(".")[0];

      const result = await cloudinary.uploader.destroy(publicId);

      if (result.result !== "ok") {
        return res
          .status(500)
          .json({ message: "Failed to delete image from Cloudinary" });
      }
    }

    await Course.findByIdAndDelete(courseId);

    res.status(200).json({ message: "Course deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal server error" });
  }
});


router.get("/get-teachers", async (req, res) => {
  try {
    const teachers = await Signup.find({ role: "Teacher" }).select("-password");
    // console.log("teahcers", teachers);
 
    if (!teachers || teachers.length === 0) {
      return res.status(404).json({ message: "No teachers found" });
    }
 
    return res.status(200).json({ teachers });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: error.stack,
    });
  }
});

router.get("/get-students", async (req, res) => {
  try {
    const students = await Signup.find({ role: "Student" }).select("-password");
    // console.log("students", students);
 
    if (!students || students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }
 
    return res.status(200).json({ students });
  } catch (error) {
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
      stack: error.stack,
    });
  }
});

module.exports = router;
