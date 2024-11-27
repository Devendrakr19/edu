const express = require("express");
const router = express.Router();
const Course = require('../models/courseModal');
const multer = require("multer");
const path = require('path');

const storage = multer.diskStorage({
    destination: function(req, file, cb){
        cb(null, 'imgstored');
    },
    filename: function(req, file, cb){
        cb(null, Date.now() + path.extname(file.originalname));
    }
})

const fileFilter = (req, file, cb)=>{
    if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png' || file.mimetype === 'image/gif'){
        cb(null, true);
    }else{
        cb(new Error('Invalid file type. Only JPEG, PNG, or GIF allowed.'), false);
    }
}

const upload = multer({
    storage:storage,
    fileFilter:fileFilter
})

router.post("/create-course", upload.single('img'), async (req, res) =>{
    try{
        const {name, category, subcategory, level, coursetitle, idpaid, price, duration, comment} = req.body;

        const img = req.file ? req.file.path : null;

        const course = new Course({
            name, 
            category, 
            subcategory, 
            level, 
            coursetitle, 
            idpaid, 
            price, 
            duration, 
            img, 
            comment
        })

        await course.save();

        res.status(201).json(
            {
                message:"Course Create successfully.", 
                id: course._id,
                name: course.name, 
                category: course.category,
                subcategory: course.subcategory,
                level: course.level,
                coursetitle: course.coursetitle, 
                idpaid: course.idpaid,
                price: course.price, 
                duration: course.duration,
                img: course.img, 
                comment: course.comment
            })
    }
    catch (error){
        res.status(500).json({message:"Internal server error"})
    }
})

// Show all courses
router.get("/get-course", async (req, res) =>{
    try{
        const courses = await Course.find();

        if(!courses.length){
            return res.status(404).json({message:"No course found"});
        }
        res.status(200).json({courses});
    }catch (error){
        res.status(500).json({message: "Internal server error"})
    }5
})

router.delete("/delete-course/:id", async (req, res) =>{
    try{

        const courseId = req.params.id;

        const course = await Course.findById(courseId);

        if(!course){
            return res.status(404).json({message:"Course not found"});
        }
        if (course.img) {
            const imgPath = path.join(__dirname, '..', course.img);
            fs.unlinkSync(imgPath); // Delete the image from disk
        }

        await Course.findByIdAndDelete(courseId);
        res.status(200).json({ message: "Course deleted successfully" });
    }catch (error){
        res.status(500).json({message:"Internal server error"});
    }
})

module.exports = router;