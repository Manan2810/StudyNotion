const otpGenerator = require("otp-generator");
const User = require("../models/User");
const OTP = require("../models/OTP");
const Profile = require("../models/Profie");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const mailSender = require("../utils/mailSender")
const { passwordUpdated } = require("../mail/templates/passwordUpdate");
require("dotenv").config()

// sendOTP
exports.sendOTP = async (req,res) => {

    try{
        // fetch email from request's body
        const {email} = req.body;
        
        // check if user already exists
        const checkUserPresent = await User.findOne({email});

        // if user already exists , send a response
        if(checkUserPresent){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }
        // genereate OTP
        let otp = otpGenerator.generate(6,{
            upperCaseAlphabets:false,
            lowerCaseAlphabets:false,
            specialChars:false,
        });
        console.log("OTP generated",otp);

        // check unique otp or not
        const result = await OTP.findOne({otp:otp});
        while(result){
            otp = otpGenerator.generate(6,{
                upperCaseAlphabets:false,
                lowerCaseAlphabets:false,
                specialChars:false,
            });
            result = await OTP.findOne({otp:otp});
        }

        const otpPayload = {email,otp};
        // creating entry in db
        const otpBody = await OTP.create(otpPayload);
        console.log(otpBody)

        // return response
        res.status(200).json({
            success:true,
            message:'OTP sent successfully',
            otp,
        })

    }
    catch(error){
        console.log(error);
        res.status(500).json({
            success:false,
            message:error.message,
        })
    }
}
// sign up
exports.signUp = async (req,res)=>{
    try{

        // data fetch from request ki body
        const {
            firstName,
            lastName,
            email,
            password,
            confirmPassword,
            accountType,
            contactNumber,
            otp
        } = req.body;

        // validation of data
        if(!firstName|| !lastName|| !email || !password || !confirmPassword  || !otp){
            return res.status(403).json({
                success:false,
                message:"All fields are required"
            })
        }
        // password matching
        if(password!==confirmPassword){
            return res.status(400).json({
                success:false,
                message:"password and confirm password donot match"
            })
        }
        // check user already exist or not
        const checkUser = await User.findOne({email});
        if(checkUser){
            return res.status(401).json({
                success:false,
                message:'User already registered',
            })
        }
        // find most recent OTP stored for the user 
        const recentOtp = await OTP.find({email}).sort({createdAt:-1}).limit(1);
        // validate otp
        if(recentOtp.length==0){
            // OTP not found
            return res.status(400).json({
                success:false,
                message:'OTP not found',
            })
        }else if(otp !== recentOtp.otp){
            // Invalid otp
            return res.status(400).json({
                success:false,
                message:'Invalid OTP',
            })
        }
        // hash password
        const hashedPassword = await bcrypt.hash(password,10);
        // entry in db

        const profileDetails = await Profile.create({
            gender:null,
            dateOfBirth:null,
            about:null,
            contactNumber:null,
        });

        const user = await User.create({
            firstName,
            lastName,
            email,
            contactNumber,
            password:hashedPassword,
            accountType,
            additionalDetails:profileDetails._id,
            image:`https://api.dicebear.com/5.x/initials/svg?seed=${firstName}${lastName}`,
        })
        // response send
        return res.status(200).json({
            success:true,
            message:"User is registered successfully",
            user,
        })

    }
    catch(error) {
        console.error(error);
        return res.status(500).json({
            success:false,
            message:'User cannot be registered, please try again later',
        });
    }

}
// login
exports.login = async (req,res)=>{
    try{
        //data fetch
        const {email, password} = req.body;
        //validation on email and password
        if(!email || !password) {
            return res.status(403).json({
                success:false,
                message:'Please fill all the details carefully',
            });
        }

        //check for registered user
        const user = await User.findOne({email}).populate("additionalDetails");
        //if not a registered user
        if(!user) {
            return res.status(401).json({
                success:false,
                message:'User is not registered',
            });
        }
        // generate JWT , after password matching
        if(await bcrypt.compare(password,user.password)){
            const payload = {
                email:user.email,
                id:user._id,
                accountType:user.accountType,
            }
            const token = jwt.sign(payload,process.env.JWT_SECRET,{
                expiresIn:"2h",
            });
            user.token = token;
            user.password=undefined;
            // create cookie and send response
            const options = {
                expires: new Date(Date.now()+3*24*60*60*1000),
                httpOnly: true,
            };
            res.cookie("token",token,options).status(200).json({
                success:true,
                token,
                user,
                message:"Logged in Successfully"
            })
        }
        else {
            //passwsord do not match
            return res.status(403).json({
                success:false,
                message:"Password Incorrect",
            });
        }

    }catch(error) {
        console.log(error);
        return res.status(500).json({
            success:false,
            message:'Login Failure',
        });
    }
}
// change password
exports.changePassword = async (req,res) =>{
    try{
        // get data from req body
        const userDetails = await User.findById(req.user.id);
        // get oldPassword,newPassword,confirmNewPassword
        const {oldPassword,newPassword,confirmNewPassword} = req.body;
        // check if oldPassword entered matches the one stored in database
        const isMatch = await bcrypt.compare(oldPassword, userDetails.password);
        if (!isMatch) {
            return res.status(400).json({
                success: false,
                message: "password is incorrect"
            });
        }

        // check if new password and confirm password are same
        if(newPassword!==confirmNewPassword){
            return res.status(400).json({
                success:false,
                message:"new password and confirm password does not match"
            })
        }

        // update password in DB
        const encryptedPassword = await bcrypt.hash(newPassword, 10);
		const updatedUserDetails = await User.findByIdAndUpdate(
			req.user.id,
			{ password: encryptedPassword },
			{ new: true }
		);

        // send mail - Password updated
        try {
			const emailResponse = await mailSender(
				updatedUserDetails.email,
				passwordUpdated(
					updatedUserDetails.email,
					`Password updated successfully for ${updatedUserDetails.firstName} ${updatedUserDetails.lastName}`
				)
			);
			console.log("Email sent successfully:", emailResponse.response);
		} catch (error) {
			// If there's an error sending the email, log the error and return a 500 (Internal Server Error) error
			console.error("Error occurred while sending email:", error);
			return res.status(500).json({
				success: false,
				message: "Error occurred while sending email",
				error: error.message,
			});
		}

        // return response
        return res.status(200).json({
            success: true,
            message: 'Password updated successfully',
        });
    }catch (error) {
        console.error('Error in changePassword:', error);
        return res.status(500).json({
            success: false,
            message: 'An error occurred while processing your request',
            error: error.message,
        });
    }

}