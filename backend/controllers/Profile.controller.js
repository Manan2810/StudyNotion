const Profile = require("../models/Profie")
const User = require("../models/User")


exports.updateProfile = async (req,res)=>{
    try {
        // get data
        const {dateOfBirth="",about="",contactNumber} =req.body;
        // get userId
        const userId = req.user.id;
        
        // find the profile
        const userDetails = await User.findById(userId);
        const profileId = userDetails.additionalDetails;
        const profileDetails = await Profile.findById(profileId);
        // update the profile -> save vaala tareeka kyunki yha object pehle se bna hua hai
        profileDetails.dateOfBirth = dateOfBirth;
        profileDetails.about = about;
        profileDetails.contactNumber = contactNumber;

        await profileDetails.save();
        // return response
        return res.status(200).json({
            success:true,
            message:"Profile updated Successfully",
            profileDetails
        })
    } catch(error) {
        return res.status(500).json({
            success:false,
            message:"Profile not updated",
            error:error.message
        })
    }
}

// delete account
exports.deleteAccount = async (req,res)=>{
    try{
        // get id
        const id = req.user.id;
        // validation
        const userDetails = await User.findById(id);
        if(!userDetails){
            return res.status(404).json({
                success:false,
                message:"No such user exists"
            })
        }
        // delete profile
        await Profile.findByIdAndDelete({_id:userDetails.additionalDetails});
        // user delete
        await User.findByIdAndDelete({_id:id});
        // TODO -> un-enroll user from enrolled number of user
        // response return
        return res.status(200).json({
            success:true,
            message:"User account deleted successfully"
        })
    }
    catch(error){
        return res.status(500).json({
            success:false,
            message:"Problem in deleting user account",
            error:error.message
        })
    }
}

// get all the user details
exports.getUserDetials = async (req,res)=>{
    try{
        const id = req.user.id;
        const userDetails = await User.findById(id).populate("additionalDetails").exec();
        return res.status(200).json({
            success:true,
            message:"User data fetched successfully",
            data:userDetails
        })

    }catch(error){
        return res.status(500).json({
            success:false,
            message:"Problem in fetching user details",
            error:error.message
        })
    }
}