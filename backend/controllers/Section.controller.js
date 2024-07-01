const Section = require("../models/Section")
const Course = require("../models/Course")

exports.createSection = async (req,res) => {
    try{
        // fetch data
        const {sectionName,courseId} = req.body;
        // validation of data
        if(!sectionName||!courseId){
            return res.status(400).json({
                success:false,
                message:"Please the all the fields"
            })
        }
        // create section
        const newSection = await Section.create({sectionName});
        // enter the section object id in course schema
        const upadatedCourse = await Course.findByIdAndUpdate(courseId,{
                                                              $push:{
                                                                  courseContent:newSection._id
                                                              },
                                                            },
                                                            {new:true}
        ).populate({
            path:"courseContent",
            populate:{
                path:"SubSection"
            }
        }).exec();
        // return response
        return res.status(200).json({
            success:true,
            message:"Section created successfully",
            upadatedCourse
        })


    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to create section",
            error:error.message
        })
    }
}

// update Section
exports.updateSection = async (req,res)=>{
    try {
        // data input
        const {sectionName,sectionId} = req.body;
        // validation
        if(!sectionName||!sectionId){
            return res.status(400).json({
                success:false,
                message:"Please the all the fields"
            })
        }
        // update section
        const section = await Section.findByIdAndUpdate(sectionId,{sectionName},{new:true})
        // return response
        return res.status(200).json({
            success:true,
            message:section
        })

    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to update section",
            error:error.message
        })
    }
}

exports.deleteSection = async (req,res)=>{
    try{
        // get id - assumig we are sending id in params
        const {sectionId} = req.params
        // use findByIdAndDelete
        await Section.findByIdAndDelete(sectionId);
        // TODO[Testing]: do we need to delete the entry from the course schema??
        // return response
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully"
        })
    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Unable to delete section",
            error:error.message
        })
    }
}
