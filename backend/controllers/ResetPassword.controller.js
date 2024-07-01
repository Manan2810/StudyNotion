const User = require("../models/User");
const mailSender = require("../utils/mailSender");
const bcrypt = require("bcrypt")
// reset password token -> mail send karne ka kaam yeh kar rha
exports.resetPasswordToken =  async (req,res)=>{
    try{
        // get email from request body
        const email = req.body.email;

        // check user for the email
        const user = await User.findOne({email:email});
        if(!user){
            return res.status(400).json({
                success:false,
                message:"Your email is not registered",
            })
        }

        // generate token
        const token = crypto.randomUUID();

        // update user by adding token and expiration time
        const updatedDetails = await User.findByIdAndUpdate({email:email},{token:token,resetPasswordExpires:Date.now()+3600000,},{new:true});

        // create url
        const url = `https://localhost:3000/update-password/${token}`;

        // send mail sending the url
        await mailSender(email,"Password Reset Link",`Password Reset Link ${url}`);

        // return response
        return res.json({
            success:true,
            message:"Link sent successfully"
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"Something went wrong while resetting the password"
        })
    }   
}

// reset password -> password update in db
exports.resetPassword = async (req,res)=>{
    try{
        // data fetch
        const {password,confirmPassword,token} = req.body;
        // validation
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"Password Not Matching"
            })
        }
        // fetch out the userdetails
        const userDetails = User.findOne({token:token});

        if(!userDetails){
            return res.status(400).json({
                success:false,
                message:"token invalid"
            })
        }

        if(userDetails.resetPasswordExpires<Date.now()){
            return res.status(400).json({
                success:false,
                message:"Token expired,regenerate the token"
            })
        }

        const hashedPassword = await bcrypt.hash(password,10);

        await User.findOneAndUpdate(
            {token:token},
            {password:hashedPassword},
            {new:true}
        )

        return res.status(200).json({
            success:true,
            message:"Password reset successfully"
        })
    }catch(error){
        console.log(error);
        return res.status(500).json({
            success:false,
            message:"something went wrong while sending reset pwd mail"
        })
    }
}