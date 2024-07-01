const Course = require("../models/Course")
const Category = require("../models/Category")
const User = require("../models/User")
const {uploadImageToCloudinary} = require("../utils/imageUpload")
require("dotenv").config()

// create Course constroller
exports.createCourse = async (req,res)=>{
    try{
        // fetch data
        const {courseName,courseDescription,whatYouWillLearn,price,tag,category,status,instructions} = req.body;
        // fetch file
        const thumbnail = req.files.thumbnailImage;
        // validation
        if(!courseName || !courseDescription || !whatYouWillLearn || !price || !category || !thumbnail||!tag){
            return res.status(400).json({
                success:false,
                message:"please enter all the valid details"
            })
        }
        if (!status || status === undefined) {
			status = "Draft";
		}
        // check for instructor
        const userId = req.user.id;
        const instructorDetails =await User.findById(userId);
        console.log("Instructor Details",instructorDetails);

        if(!instructorDetails){
            return res.status(404).json({
                success:false,
                message:"instructor details not found"
            })
        }
        // category -> validation
        const categoryDetails =await Category.findById(category);
        if(!categoryDetails){
            return res.status(404).json({
                success:false,
                message:"instructor details not found"
            })
        }
        // cloudinary image upload -> return me hame ek secure url milta hai
        const thumbnailImage = await uploadImageToCloudinary(thumbnail,process.env.FOLDER_NAME)
        
        // create entry in db
        const newCourse = await Course.create({
			courseName,
			courseDescription,
			instructor: instructorDetails._id,
			whatYouWillLearn: whatYouWillLearn,
			price,
			tag: tag,
			category: categoryDetails._id,
			thumbnail: thumbnailImage.secure_url,
			status: status,
			instructions: instructions,
		});
        // add course entry in user schema for instructor
        await User.findByIdAndUpdate(
            {_id:instructorDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true} //updated response mile
        )
        // add course entry in category
        await Category.findByIdAndUpdate(
            {_id:categoryDetails._id},
            {
                $push:{
                    courses:newCourse._id
                }
            },
            {new:true} //updated response mile
        )
        // return response
        return res.status(200).json({
            success:true,
            message:"Course created successfully",
            data:newCourse,
        })
        
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"failed to create course",
            error:error.message
        })
    }
}

// get all courses
exports.showAllCourses = async (req,res)=>{
    try {
        const allCourses = await Course.find({},{courseName:true,price:true,thumbnail:true,instructor:true,ratingAndReviews:true,studentsEnrolled:true}).populate("instructor").exec();
        return res.status(200).json({
            success:true,
            message:"Data of all courses fetched Successfully",
            data:allCourses
        })
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"failed to fetch course",
            error:error.message
        })
    }
}

// get course details
exports.getCourseDetails = async (req,res)=>{
    try {
        // get id
        const {courseId} = req.body
        // find course details
        const courseDetails = await Course.find({_id:courseId}).populate({
            path:"instructor",
            populate:{
                path:"additionalDetails",
            }
        })
        .populate("category")
        .populate("ratingAndReviews")
        .populate("studentsEnrolled")
        .populate({
            path:"courseContent",
            populate:{
                path:"subSection",
            }
        })
        .exec();

        if(!courseDetails){
            return res.status(400).json({
                success:false,
                message:`Couldn't find the course with ${courseId}`
            })
        }
        return res.status(200).json({
            success:true,
            message:"Course details fetched successfully",
            data:courseDetails
        })

    } catch (error) {
        console.log(error)
        return res.status(500).json({
            success:false,
            message:error.message
        })
    }
}