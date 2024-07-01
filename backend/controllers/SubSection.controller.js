const SubSection = require("../models/SubSection")
const Section = require("../models/Section")

exports.createSubsection = async (req,res) =>{
    try {
        // fetch data
        const {title,timeDuration,description,sectionId} = req.body;
        
        // extract video file
        const video = req.files.videoFile;
        // validate
        if(!title||!timeDuration||!description||!video||!sectionId){
            return res.status(400).json({
                success:false,
                message:"Please fill all the required fields"
            })
        }

        // upload video to cloudinary
        const uploadDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)
        //create a new subsection
        const newSubsection = await SubSection.create({title:title,timeDuration:timeDuration,description:description,videoUrl:uploadDetails.secure_url});
        // update the section
        const updatedSection = await Section.findByIdAndUpdate({_id:sectionId},{
            $push:{
                subSection:newSubsection._id
            }
        },{new:true}).populate("subSection");
        // return response
        return res.status(200).json({
            success:true,
            message:"Subsection created Successfully"
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Subsection cannot be created",
            error:error.message
        })
    }
}

exports.updateSubsection = async (req,res) =>{
    try {
        // data input
        const {title,timeDuration,description,SubSectionId} = req.body;
        const newVideo = req.files.videoFile;
        // validation
        if(!title||!timeDuration||!description||!newVideo||!SubSectionId){
            return res.status(400).json({
                success:false,
                message:"Please the all the fields"
            })
        }
        const updatedDetails = await uploadImageToCloudinary(video,process.env.FOLDER_NAME)
        // update section
        const subSection = await SubSection.findByIdAndUpdate(SubSectionId,{title,timeDuration,description,videoUrl:updatedDetails.secure_url},{new:true})
        // return response
        return res.status(200).json({
            success:true,
            message:"Sub-Section updated successfully"
        })

    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Sub-Section cannot be updated",
            error:error.message
        })
    }
}


exports.deleteSubsection = async (req,res) =>{
    try {
        // get id - assumig we are sending id in params
        const {SubSectionId} = req.params
        // use findByIdAndDelete
        await SubSection.findByIdAndDelete(SubSectionId);
        // TODO[Testing]: do we need to delete the entry from the section schema??
        // return response
        return res.status(200).json({
            success:true,
            message:"Section deleted successfully"
        })
    } catch(error){
        return res.status(500).json({
            success:false,
            message:"Subsection cannot be deleted",
            error:error.message
        })
    }
}